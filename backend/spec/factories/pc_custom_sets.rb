# frozen_string_literal: true

FactoryBot.define do
  factory :pc_custom_set do
    sequence(:name) { |n| "マイPC構成 #{n}" }
    association :user

    trait :with_parts do
      association :cpu, factory: :parts_cpu
      association :gpu, factory: :parts_gpu
      association :memory, factory: :parts_memory
      association :storage1, factory: :parts_storage
      association :os, factory: :parts_os
    end

    trait :full_parts do
      with_parts
      association :storage2, factory: :parts_storage
      association :storage3, factory: :parts_storage
    end
  end
end
