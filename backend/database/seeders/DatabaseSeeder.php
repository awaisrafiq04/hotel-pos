<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        DB::table('users')->insert([
            [
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'name' => 'Admin User',
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'chef',
                'password' => Hash::make('chef123'),
                'name' => 'Chef User',
                'role' => 'chef',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'waiter',
                'password' => Hash::make('waiter123'),
                'name' => 'Waiter User',
                'role' => 'waiter',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Settings
        DB::table('settings')->insert([
            ['key' => 'currency', 'value' => 'USD', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'tax_rate', 'value' => '0.10', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'restaurant_name', 'value' => 'Grand Hotel', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Categories
        $categories = [
            ['name' => 'Starters', 'image' => 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=300&h=200&fit=crop'],
            ['name' => 'Main Course', 'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop'],
            ['name' => 'Pizza', 'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop'],
            ['name' => 'Pasta', 'image' => 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=200&fit=crop'],
            ['name' => 'Drinks', 'image' => 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop'],
            ['name' => 'Desserts', 'image' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop'],
        ];
        DB::table('categories')->insert(array_map(fn($c) => $c + ['created_at' => now(), 'updated_at' => now()], $categories));

        // Menu Items (Simplified for brevity, fetch IDs dynamically in real app or assume numeric)
        // Assuming IDs 1-6 for categories
        $menuItems = [
            ['name' => 'Bruschetta', 'price' => 8.99, 'category_id' => 1, 'image' => 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=200&fit=crop', 'description' => 'Toasted bread with tomatoes', 'available' => true],
            ['name' => 'Grilled Steak', 'price' => 24.99, 'category_id' => 2, 'image' => 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&h=200&fit=crop', 'description' => 'Premium beef steak', 'available' => true],
            ['name' => 'Margherita Pizza', 'price' => 12.99, 'category_id' => 3, 'image' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', 'description' => 'Classic tomato and mozzarella', 'available' => true],
            ['name' => 'Cola', 'price' => 2.99, 'category_id' => 5, 'image' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=200&fit=crop', 'description' => 'Chilled cola drink', 'available' => true],
        ];
        DB::table('menu_items')->insert(array_map(fn($m) => $m + ['created_at' => now(), 'updated_at' => now()], $menuItems));

        // Tables
        $tables = [
            ['name' => 'Table 1', 'capacity' => 2, 'status' => 'free'],
            ['name' => 'Table 2', 'capacity' => 2, 'status' => 'free'],
            ['name' => 'Table 3', 'capacity' => 4, 'status' => 'occupied'],
            ['name' => 'Table 4', 'capacity' => 4, 'status' => 'free'],
            ['name' => 'Table 5', 'capacity' => 6, 'status' => 'free'],
            ['name' => 'Table 6', 'capacity' => 8, 'status' => 'reserved'],
        ];
        DB::table('restaurant_tables')->insert(array_map(fn($t) => $t + ['created_at' => now(), 'updated_at' => now()], $tables));
    }
}
