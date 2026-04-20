<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'resi' => 'required|string|unique:orders,resi',
            'recipient_name' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'note' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'sender_id' => 'required|exists:senders,id',
            'shipment_id' => 'nullable|exists:shipments,id',
        ];
    }
}
