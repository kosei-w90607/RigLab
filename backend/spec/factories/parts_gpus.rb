# frozen_string_literal: true

FactoryBot.define do
  factory :parts_gpu do
    sequence(:name) { |n| "GeForce RTX 407#{n}" }
    maker { 'NVIDIA' }
    price { 85_000 }
    tdp { 200 }
    length_mm { 285 }
    specs do
      {
        chip: 'RTX 4070',
        vram: 12,
        vram_type: 'GDDR6X',
        slot_size: 2,
        power_connector: '8pin x1'
      }
    end
  end
end
