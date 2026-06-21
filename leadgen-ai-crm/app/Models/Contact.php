<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'name',
        'email',
        'company',
        'phone',
        'status',
        'ai_score',
        'ai_rationale',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'ai_score' => 'decimal:2',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('performed_at', 'desc');
    }
}
