# frozen_string_literal: true

FactoryBot.define do
  factory :pc_entrust_set do
    sequence(:name) { |n| "おまかせ構成#{n}" }
    description { 'ゲームを快適にプレイできる構成です' }
    budget_range { 'middle' }
    use_case { 'gaming' }

    association :cpu, factory: :parts_cpu
    association :gpu, factory: :parts_gpu
    association :memory, factory: :parts_memory
    association :storage1, factory: :parts_storage
    association :os, factory: :parts_os

    trait :entry do
      budget_range { 'entry' }
    end

    trait :high do
      budget_range { 'high' }
    end

    trait :creative do
      use_case { 'creative' }
    end

    trait :office do
      use_case { 'office' }
    end
  end
end
