<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    public function index()
    {
        $items = DB::table('inventory_items')->get();
        foreach ($items as $item) {
            if ($item->image && !str_starts_with($item->image, 'http')) {
                $item->image = url(str_replace('storage/', 'api/media/', $item->image));
            }
        }
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'min_stock' => 'nullable|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('inventory', 'public');
            $data['image'] = 'storage/' . $path;
        }

        $data['created_at'] = now();
        $data['updated_at'] = now();

        $id = DB::table('inventory_items')->insertGetId($data);
        $item = DB::table('inventory_items')->where('id', $id)->first();
        
        if ($item->image) {
            $item->image = url(str_replace('storage/', 'api/media/', $item->image));
        }

        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|numeric',
            'unit' => 'sometimes|required|string',
            'min_stock' => 'nullable|numeric',
            'image' => 'nullable' // Can be a file or a string (existing path)
        ]);

        $item = DB::table('inventory_items')->where('id', $id)->first();
        if (!$item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($item->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $item->image));
            }
            $path = $request->file('image')->store('inventory', 'public');
            $data['image'] = 'storage/' . $path;
        }

        $data['updated_at'] = now();
        DB::table('inventory_items')->where('id', $id)->update($data);

        $updatedItem = DB::table('inventory_items')->where('id', $id)->first();
        if ($updatedItem->image) {
            $updatedItem->image = url(str_replace('storage/', 'api/media/', $updatedItem->image));
        }

        return response()->json($updatedItem);
    }

    public function destroy($id)
    {
        $item = DB::table('inventory_items')->where('id', $id)->first();
        if ($item && $item->image) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $item->image));
        }
        DB::table('inventory_items')->where('id', $id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
