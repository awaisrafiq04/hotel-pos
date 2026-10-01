<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PurchaseCategoryController extends Controller
{
    public function index()
    {
        $categories = \Illuminate\Support\Facades\DB::table('purchase_categories')->orderBy('name')->get();
        // If empty, seed defaults for convenience
        if ($categories->isEmpty()) {
            $defaults = ['Supplies', 'Electricity', 'Rent', 'Maintenance', 'Salaries', 'Other'];
            foreach ($defaults as $name) {
                \Illuminate\Support\Facades\DB::table('purchase_categories')->insert([
                    'name' => $name,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            $categories = \Illuminate\Support\Facades\DB::table('purchase_categories')->orderBy('name')->get();
        }
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:purchase_categories,name']);
        
        $id = \Illuminate\Support\Facades\DB::table('purchase_categories')->insertGetId([
            'name' => $request->name,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Category added', 'id' => $id]);
    }

    public function destroy($id)
    {
        \Illuminate\Support\Facades\DB::table('purchase_categories')->where('id', $id)->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
