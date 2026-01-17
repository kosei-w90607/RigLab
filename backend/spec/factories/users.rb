# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'password123' }
    password_confirmation { 'password123' }
    confirmed_at { Time.current }
    role { 'user' }

    trait :admin do
      role { 'admin' }
    end
  end
end
