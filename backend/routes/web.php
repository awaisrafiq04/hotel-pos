<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return '<div style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f9ff; color: #0369a1;">
        <div style="text-align: center;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">🚀</h1>
            <h1>POS Backend API is Running</h1>
            <p>Ready to serve requests.</p>
        </div>
    </div>';
});
