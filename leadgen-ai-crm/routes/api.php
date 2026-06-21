<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Support\Facades\Route;

Route::prefix('contacts')->group(function () {
    Route::get('/', [ContactController::class, 'index']);
    Route::post('/', [ContactController::class, 'store']);
    Route::get('{contact}', [ContactController::class, 'show']);
    Route::put('{contact}', [ContactController::class, 'update']);
    Route::delete('{contact}', [ContactController::class, 'destroy']);

    Route::prefix('{contact}/activities')->group(function () {
        Route::get('/', [ActivityController::class, 'index']);
        Route::post('/', [ActivityController::class, 'store']);
        Route::get('{activity}', [ActivityController::class, 'show']);
        Route::put('{activity}', [ActivityController::class, 'update']);
        Route::delete('{activity}', [ActivityController::class, 'destroy']);
    });
});
