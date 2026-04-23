<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['resi', 'recipient_name', 'image_path', 'note', 'created_by', 'sender_id', 'shipment_id', 'created_by_name'])]

class Order extends Model
{
    use HasFactory, SoftDeletes;

    public function created_by_relation()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sender_relation()
    {
        return $this->belongsTo(Sender::class, 'sender_id');
    }

    public function shipment_relation()
    {
        return $this->belongsTo(Shipment::class, 'shipment_id');
    }
}
