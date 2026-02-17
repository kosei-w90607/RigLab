FactoryBot.define do
  factory :social_account do
    user
    provider { "google" }
    sequence(:uid) { |n| "google_uid_#{n}" }
    sequence(:email) { |n| "google#{n}@example.com" }
    name { "Google User" }
  end
end
