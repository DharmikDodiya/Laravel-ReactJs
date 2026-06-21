<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|string|in:email_opened,page_visited,call_logged',
            'description' => 'required|numeric',
            'metadata' => 'nullable|array',
            'performed_at' => 'nullable|date',
        ];
    }
}
