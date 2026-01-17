# frozen_string_literal: true

FactoryBot.define do
  factory :parts_cpu do
    sequence(:name) { |n| "Intel Core i7-1470#{n}K" }
    maker { 'Intel' }
    price { 52_000 }
    socket { 'LGA1700' }
    tdp { 125 }
    memory_type { 'DDR5' }
    specs do
      {
        cores: 20,
        threads: 28,
        base_clock: '3.4GHz',
        boost_clock: '5.6GHz'
      }
    end
  end
end
