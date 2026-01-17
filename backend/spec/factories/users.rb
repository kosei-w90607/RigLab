# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'password123' }
    password_confirmation { 'password123' }
    confirmed_at { Time.current }

    trait :admin do
      after(:create) do |user|
        user.update(admin: true) if user.respond_to?(:admin=)
      end
    end
  end
end
