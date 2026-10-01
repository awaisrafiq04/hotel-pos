<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Tables
    public function getTables()
    {
        return response()->json(DB::table('restaurant_tables')->get());
    }

    public function updateTable(Request $request, $id)
    {
        DB::table('restaurant_tables')->where('id', $id)->update(['status' => $request->status]);
        return response()->json(['message' => 'Table updated']);
    }

    public function storeTable(Request $request)
    {
        $id = DB::table('restaurant_tables')->insertGetId([
            'name' => $request->name,
            'capacity' => $request->capacity ?? 4,
            'status' => 'free',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return response()->json(DB::table('restaurant_tables')->find($id));
    }

    public function deleteTable($id)
    {
        DB::table('restaurant_tables')->where('id', $id)->delete();
        return response()->json(['message' => 'Table deleted']);
    }

    // Orders
    public function index()
    {
        $orders = DB::table('orders')
            ->leftJoin('users', 'orders.waiter_id', '=', 'users.id')
            ->leftJoin('restaurant_tables', 'orders.table_id', '=', 'restaurant_tables.id')
            ->select('orders.*', 'users.name as waiter_name', 'restaurant_tables.name as table_name')
            ->orderBy('orders.created_at', 'desc')
            ->limit(50)
            ->get();
        // Fetch items for each order
        foreach ($orders as $order) {
            $order->items = DB::table('order_items')
                ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                ->where('order_items.order_id', $order->id)
                ->select('order_items.*', 'menu_items.name', 'menu_items.image', 'menu_items.cost_price')
                ->get()
                ->map(function($item) {
                    if ($item->image && !str_starts_with($item->image, 'http')) {
                        $item->image = url($item->image);
                    }
                    return $item;
                });
        }
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'orderType' => 'required',
            'waiterId' => 'required|exists:users,id',
            'items' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            // Generate unique order number
            $maxOrder = DB::table('orders')->max('order_number');
            $nextOrderNumber = $maxOrder ? intval($maxOrder) + 1 : 1001;

            $orderId = DB::table('orders')->insertGetId([
                'order_number' => $nextOrderNumber,
                'table_id' => $request->tableId,
                'status' => 'pending',
                'order_type' => $request->orderType,
                'subtotal' => $request->subtotal,
                'tax' => $request->tax,
                'total' => $request->total,
                'waiter_id' => $request->waiterId,
                'customer_name' => $request->customerName,
                'customer_address' => $request->customerAddress,
                'customer_phone' => $request->customerPhone,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $items = $request->items;
            foreach ($items as $item) {
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'menu_item_id' => $item['menuItemId'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'notes' => $item['notes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($request->tableId) {
                DB::table('restaurant_tables')->where('id', $request->tableId)->update(['status' => 'occupied']);
            }

            DB::commit();
            return response()->json(['message' => 'Order created', 'id' => $orderId]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'tax' => 'required|numeric',
            'total' => 'required|numeric',
            'orderType' => 'required',
            'waiterId' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            // Update order record
            DB::table('orders')->where('id', $id)->update([
                'table_id' => $request->tableId,
                'order_type' => $request->orderType,
                'subtotal' => $request->subtotal,
                'tax' => $request->tax,
                'total' => $request->total,
                'waiter_id' => $request->waiterId, // Update waiter to the one who edited
                'customer_name' => $request->customerName,
                'customer_address' => $request->customerAddress,
                'customer_phone' => $request->customerPhone,
                'updated_at' => now(),
            ]);

            // Replace items
            DB::table('order_items')->where('order_id', $id)->delete();

            foreach ($request->items as $item) {
                DB::table('order_items')->insert([
                    'order_id' => $id,
                    'menu_item_id' => $item['menuItemId'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'notes' => $item['notes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Order updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update order', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        DB::table('orders')->where('id', $id)->update(['status' => $request->status, 'updated_at' => now()]);
        
        // If completed, free table
        if ($request->status === 'completed') {
            $order = DB::table('orders')->find($id);
            if ($order && $order->table_id) {
                DB::table('restaurant_tables')->where('id', $order->table_id)->update(['status' => 'free']);
            }
        }
        
        return response()->json(['message' => 'Status updated']);
    }

    public function getDailyReport(Request $request)
    {
        $date = $request->query('date');
        
        $query = DB::table('orders')->orderBy('created_at', 'desc');

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $orders = $query->get();
            
        // Fetch items for these orders
        // Optimization: Get all order IDs first
        $orderIds = $orders->pluck('id')->toArray();
        if (!empty($orderIds)) {
            $items = DB::table('order_items')
                ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                ->whereIn('order_items.order_id', $orderIds)
                ->select('order_items.*', 'menu_items.name', 'menu_items.image', 'menu_items.price as item_price', 'menu_items.cost_price')
                ->get();
            
            // Map items to orders
            $itemsGrouped = $items->groupBy('order_id');
            foreach ($orders as $order) {
                $order->items = ($itemsGrouped->get($order->id) ?? collect([]))->map(function($item) {
                    if ($item->image && !str_starts_with($item->image, 'http')) {
                        $item->image = url($item->image);
                    }
                    return $item;
                });
            }
        } else {
             foreach ($orders as $order) {
                $order->items = [];
             }
        }
        
        return response()->json([
            'date' => $date ?? 'All Time',
            'orders' => $orders,
            'total_sales' => $orders->sum('total'),
            'total_orders' => $orders->count(),
            'completed_orders' => $orders->where('status', 'completed')->count(),
        ]);
    }
}
