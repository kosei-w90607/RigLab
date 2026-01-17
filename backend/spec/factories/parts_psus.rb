# frozen_string_literal: true

FactoryBot.define do
  factory :parts_psu do
    sequence(:name) { |n| "RM850x #{n}" }
    maker { 'Corsair' }
    price { 18_000 }
    wattage { 850 }
    form_factor { 'ATX' }
    specs do
      {
        efficiency: '80PLUS Gold',
        modular: true
      }
    end

    trait :sfx do
      form_factor { 'SFX' }
      wattage { 750 }
    end
  end
end
