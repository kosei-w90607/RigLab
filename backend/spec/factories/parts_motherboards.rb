# frozen_string_literal: true

FactoryBot.define do
  factory :parts_motherboard do
    sequence(:name) { |n| "Z790 Gaming #{n}" }
    maker { 'ASUS' }
    price { 35_000 }
    socket { 'LGA1700' }
    memory_type { 'DDR5' }
    form_factor { 'ATX' }
    specs do
      {
        chipset: 'Z790',
        memory_slots: 4,
        max_memory: 128
      }
    end

    trait :ddr4 do
      memory_type { 'DDR4' }
      socket { 'LGA1200' }
    end

    trait :am5 do
      socket { 'AM5' }
    end

    trait :matx do
      form_factor { 'mATX' }
    end

    trait :itx do
      form_factor { 'ITX' }
    end
  end
end
