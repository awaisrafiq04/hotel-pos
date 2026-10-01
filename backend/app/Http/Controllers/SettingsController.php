<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = DB::table('settings')->get()->pluck('value', 'key')->toArray();
        if (isset($settings['restaurant_logo']) && !str_starts_with($settings['restaurant_logo'], 'http')) {
            $settings['restaurant_logo'] = url(str_replace('storage/', 'api/media/', $settings['restaurant_logo']));
        }
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $input = $request->all();
        
        // Handle file upload for logo if present
        if ($request->hasFile('restaurant_logo')) {
            $path = $request->file('restaurant_logo')->store('branding', 'public');
            $input['restaurant_logo'] = 'storage/' . $path;
        }

        foreach ($input as $key => $value) {
            // Skip if it's the raw file object we already handled
            if ($key === 'restaurant_logo' && $request->hasFile('restaurant_logo') && !is_string($value)) {
                $value = $input['restaurant_logo'];
            }

            // Ensure value is not null for the DB
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value ?? '', 'updated_at' => now()]
            );
        }
        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function factoryReset()
    {
        // Clear all data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Delete all images from storage
        \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('branding');
        \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('categories');
        \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('menu');
        \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('purchases');

        // Transaction Data
        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();
        DB::table('purchases')->truncate();

        // Master Data
        DB::table('menu_items')->truncate();
        DB::table('categories')->truncate();
        DB::table('purchase_categories')->truncate();
        
        // Settings
        DB::table('settings')->truncate();

        // Users (Keep Admin)
        DB::table('users')->where('role', '!=', 'admin')->delete();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Reset tables status
        DB::table('restaurant_tables')->update([
            'status' => 'free',
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'System reset successfully']);
    }
}
