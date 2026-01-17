# frozen_string_literal: true

FactoryBot.define do
  factory :parts_storage do
    sequence(:name) { |n| "Samsung 990 PRO #{n}TB" }
    maker { 'Samsung' }
    price { 18_000 }
    specs do
      {
        type: 'NVMe SSD',
        capacity: 1000,
        interface: 'PCIe 4.0',
        read_speed: 7450,
        write_speed: 6900
      }
    end
  end
end
