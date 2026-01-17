# frozen_string_literal: true

FactoryBot.define do
  factory :parts_os do
    sequence(:name) { |n| "Windows 11 Home #{n}" }
    maker { 'Microsoft' }
    price { 16_000 }
    specs do
      {
        edition: 'Home',
        architecture: '64-bit'
      }
    end
  end
end
