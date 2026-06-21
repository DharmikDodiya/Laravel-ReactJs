<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|required|string|in:email_opened,page_visited,call_logged,other',
            'description' => 'nullable|string|max:1000',
            'metadata' => 'nullable|array',
            'performed_at' => 'nullable|date',
        ];
    }
}
