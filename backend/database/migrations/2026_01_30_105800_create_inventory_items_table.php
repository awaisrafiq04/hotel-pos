<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_items', function (Blueprint $col) {
            $col->id();
            $col->string('name');
            $col->decimal('quantity', 10, 2);
            $col->string('unit');
            $col->decimal('min_stock', 10, 2)->default(5);
            $col->string('image')->nullable();
            $col->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_items');
    }
};
