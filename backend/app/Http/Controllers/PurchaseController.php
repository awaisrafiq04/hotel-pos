<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    // Get all purchases
    public function index()
    {
        $purchases = \Illuminate\Support\Facades\DB::table('purchases')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($purchases->map(function($purchase) {
            if ($purchase->image && !str_starts_with($purchase->image, 'http')) {
                $purchase->image = url(str_replace('storage/', 'api/media/', $purchase->image));
            }
            return $purchase;
        }));
    }

    // Add a new purchase
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'amount' => 'required|numeric',
            'date' => 'required|date',
            'category' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('purchases', 'public');
            $imageUrl = 'storage/' . $path;
        }

        $id = \Illuminate\Support\Facades\DB::table('purchases')->insertGetId([
            'title' => $request->title,
            'amount' => $request->amount,
            'date' => $request->date,
            'category' => $request->category ?? 'Other',
            'description' => $request->description,
            'image' => $imageUrl,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Purchase added', 'id' => $id]);
    }

    // Delete a purchase
    public function destroy($id)
    {
        $purchase = \Illuminate\Support\Facades\DB::table('purchases')->where('id', $id)->first();
        if ($purchase && $purchase->image) {
            $relativePath = str_replace('/storage/', '', $purchase->image);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
        }

        \Illuminate\Support\Facades\DB::table('purchases')->where('id', $id)->delete();
        return response()->json(['message' => 'Purchase deleted']);
    }
}
