# frozen_string_literal: true

FactoryBot.define do
  factory :parts_memory do
    sequence(:name) { |n| "DDR5-5600 32GB Kit #{n}" }
    maker { 'Crucial' }
    price { 15_000 }
    memory_type { 'DDR5' }
    specs do
      {
        capacity: 32,
        speed: 5600,
        modules: 2
      }
    end
  end
end
