FactoryBot.define do
  factory :parts_price_history do
    part_id { 1 }
    part_type { "cpu" }
    price { 50000 }
    source { "rakuten" }
    fetched_at { Time.current }

    trait :with_url do
      external_url { "https://item.rakuten.co.jp/test/123" }
      product_name { "Intel Core i7-14700K" }
    end
  end
end
