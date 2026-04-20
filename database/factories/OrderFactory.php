<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'resi' => $this->faker->unique()->bothify('RESI-#####'),
            'recipient_name' => $this->faker->name(),
            'image_path' => null,
            'note' => $this->faker->sentence(),
            'created_by' => 1,
            'sender_id' => $this->faker->numberBetween(1, 10),
            'shipment_id' => $this->faker->numberBetween(1, 5),
            'created_by_name' => 'Fadilah KUrniawan',
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
