<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    // Categories
    public function getCategories()
    {
        $categories = DB::table('categories')->get();
        return response()->json($categories->map(function($cat) {
            if ($cat->image && !str_starts_with($cat->image, 'http')) {
                $cat->image = url(str_replace('storage/', 'api/media/', $cat->image));
            }
            return $cat;
        }));
    }

    public function storeCategory(Request $request)
    {
        $imageUrl = $request->image;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $imageUrl = 'storage/' . $path;
        }

        $id = DB::table('categories')->insertGetId([
            'name' => $request->name,
            'image' => $imageUrl,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $category = DB::table('categories')->find($id);
        if ($category->image && !str_starts_with($category->image, 'http')) {
            $category->image = url(str_replace('storage/', 'api/media/', $category->image));
        }
        return response()->json($category);
    }

    public function updateCategory(Request $request, $id)
    {
        $data = [
            'name' => $request->name,
            'updated_at' => now(),
        ];

        if ($request->hasFile('image')) {
            // Delete old image if exists
            $oldCategory = DB::table('categories')->where('id', $id)->first();
            if ($oldCategory && $oldCategory->image) {
                $relativePath = str_replace('/storage/', '', $oldCategory->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
            }

            $path = $request->file('image')->store('categories', 'public');
            $data['image'] = 'storage/' . $path;
        } elseif ($request->image) {
             $data['image'] = $request->image;
        }

        DB::table('categories')->where('id', $id)->update($data);
        return response()->json(['message' => 'Category updated']);
    }

    public function deleteCategory($id)
    {
        $category = DB::table('categories')->where('id', $id)->first();
        if ($category && $category->image) {
            // Remove /storage/ prefix to get relative path for storage disk
            $relativePath = str_replace('/storage/', '', $category->image);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
        }

        DB::table('categories')->delete($id);
        return response()->json(['message' => 'Category deleted']);
    }

    // Menu Items
    public function getMenuItems()
    {
        $items = DB::table('menu_items')->get();
        return response()->json($items->map(function($item) {
            if ($item->image && !str_starts_with($item->image, 'http')) {
                $item->image = url(str_replace('storage/', 'api/media/', $item->image));
            }
            return $item;
        }));
    }

    public function storeMenuItem(Request $request)
    {
        $imageUrl = $request->image;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menu', 'public');
            $imageUrl = 'storage/' . $path;
        }

        $id = DB::table('menu_items')->insertGetId([
            'name' => $request->name,
            'price' => $request->price,
            'cost_price' => $request->cost_price ?? $request->costPrice ?? 0,
            'category_id' => $request->categoryId ?? $request->category_id, // Handle camelCase or snake_case
            'image' => $imageUrl,
            'description' => $request->description,
            'preparation_time' => $request->preparation_time ?? $request->preparationTime,
            'available' => filter_var($request->available, FILTER_VALIDATE_BOOLEAN) ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $item = DB::table('menu_items')->find($id);
        if ($item->image && !str_starts_with($item->image, 'http')) {
            $item->image = url(str_replace('storage/', 'api/media/', $item->image));
        }
        return response()->json($item);
    }

    public function updateMenuItem(Request $request, $id)
    {
        $data = $request->except(['id', 'created_at', 'updated_at', '_method']); // _method is for PUT override
        
        if ($request->hasFile('image')) {
            // Delete old image if exists
            $oldItem = DB::table('menu_items')->where('id', $id)->first();
            if ($oldItem && $oldItem->image) {
                $relativePath = str_replace('/storage/', '', $oldItem->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
            }

            $path = $request->file('image')->store('menu', 'public');
            $data['image'] = 'storage/' . $path;
        }
        
        // Normalize keys if needed
        if (isset($data['categoryId'])) {
            $data['category_id'] = $data['categoryId'];
            unset($data['categoryId']);
        }

        if (isset($data['costPrice'])) {
            $data['cost_price'] = $data['costPrice'];
            unset($data['costPrice']);
        }
        
        if (isset($data['available'])) {
             $data['available'] = filter_var($data['available'], FILTER_VALIDATE_BOOLEAN);
        }

        $data['updated_at'] = now();
        
        if (isset($data['preparationTime'])) {
            $data['preparation_time'] = $data['preparationTime'];
            unset($data['preparationTime']);
        }
        
        DB::table('menu_items')->where('id', $id)->update($data);
        return response()->json(['message' => 'Item updated']);
    }

    public function deleteMenuItem($id)
    {
        $item = DB::table('menu_items')->where('id', $id)->first();
        if ($item && $item->image) {
            $relativePath = str_replace('/storage/', '', $item->image);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
        }

        DB::table('menu_items')->delete($id);
        return response()->json(['message' => 'Item deleted']);
    }
}
