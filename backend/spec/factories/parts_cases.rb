# frozen_string_literal: true

FactoryBot.define do
  factory :parts_case do
    sequence(:name) { |n| "H510 Flow #{n}" }
    maker { 'NZXT' }
    price { 12_000 }
    form_factor { 'ATX' }
    max_gpu_length_mm { 381 }
    specs do
      {
        type: 'Mid Tower',
        side_panel: 'Tempered Glass'
      }
    end

    trait :matx do
      form_factor { 'mATX' }
      max_gpu_length_mm { 320 }
    end

    trait :itx do
      form_factor { 'ITX' }
      max_gpu_length_mm { 280 }
    end

    trait :small_gpu_clearance do
      max_gpu_length_mm { 250 }
    end
  end
end
