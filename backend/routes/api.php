<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

Route::post('/login', [AuthController::class, 'login']);

// Public routes for now (or wrap in middleware later)
Route::prefix('')->group(function () {
    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::post('/settings/reset', [SettingsController::class, 'factoryReset']);
    Route::get('/users', [AuthController::class, 'users']);
    Route::post('/users', [AuthController::class, 'createUser']);
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/forgot-password', [AuthController::class, 'sendOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Menu & Categories
    Route::get('/categories', [MenuController::class, 'getCategories']);
    Route::post('/categories', [MenuController::class, 'storeCategory']);
    Route::put('/categories/{id}', [MenuController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [MenuController::class, 'deleteCategory']);

    Route::get('/menu', [MenuController::class, 'getMenuItems']);
    Route::post('/menu', [MenuController::class, 'storeMenuItem']);
    Route::put('/menu/{id}', [MenuController::class, 'updateMenuItem']);
    Route::delete('/menu/{id}', [MenuController::class, 'deleteMenuItem']);

    // Tables
    Route::get('/tables', [OrderController::class, 'getTables']);
    Route::post('/tables', [OrderController::class, 'storeTable']);
    Route::put('/tables/{id}', [OrderController::class, 'updateTable']);
    Route::delete('/tables/{id}', [OrderController::class, 'deleteTable']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::get('/reports/daily', [OrderController::class, 'getDailyReport']);

    // Purchases
    Route::get('/purchases', [\App\Http\Controllers\PurchaseController::class, 'index']);
    Route::post('/purchases', [\App\Http\Controllers\PurchaseController::class, 'store']);
    Route::delete('/purchases/{id}', [\App\Http\Controllers\PurchaseController::class, 'destroy']);

    // Purchase Categories
    Route::get('/purchase-categories', [\App\Http\Controllers\PurchaseCategoryController::class, 'index']);
    Route::post('/purchase-categories', [\App\Http\Controllers\PurchaseCategoryController::class, 'store']);
    Route::delete('/purchase-categories/{id}', [\App\Http\Controllers\PurchaseCategoryController::class, 'destroy']);

    // Inventory
    Route::get('/inventory', [\App\Http\Controllers\InventoryController::class, 'index']);
    Route::post('/inventory', [\App\Http\Controllers\InventoryController::class, 'store']);
    Route::match(['put', 'post'], '/inventory/{id}', [\App\Http\Controllers\InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [\App\Http\Controllers\InventoryController::class, 'destroy']);

    // Setup route for live server
    Route::get('/setup-storage', function () {
        try {
            Artisan::call('storage:link');
            
            // Try to set permissions recursively
            $path = storage_path('app/public');
            if (file_exists($path)) {
                chmod($path, 0775);
                // Simple recursive chmod for subfolders
                $iterator = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
                    RecursiveIteratorIterator::SELF_FIRST
                );
                foreach ($iterator as $item) {
                    chmod($item, 0775);
                }
            }
            
            return 'Storage link created and permissions updated successfully!';
        } catch (\Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    });

    // File Proxy Route (Backup for 403 issues)
    Route::get('/media/{path}', function ($path) {
        $fullPath = storage_path('app/public/' . $path);
        if (!File::exists($fullPath)) {
            abort(404);
        }
        $file = File::get($fullPath);
        $type = File::mimeType($fullPath);
        $response = Response::make($file, 200);
        $response->header("Content-Type", $type);
        return $response;
    })->where('path', '.*');
});
