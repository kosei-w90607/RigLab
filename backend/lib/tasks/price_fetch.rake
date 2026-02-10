# frozen_string_literal: true

namespace :price do
  desc 'Fetch prices for all categories'
  task fetch_all: :environment do
    puts 'Starting price fetch for all categories...'
    PriceFetchAllJob.perform_now
    puts 'Done!'
  end

  desc 'Fetch prices for a specific category (e.g. rake price:fetch_category[cpu])'
  task :fetch_category, [:category] => :environment do |_t, args|
    category = args[:category]
    models = PriceFetchAllJob::CATEGORY_MODELS

    unless models.key?(category)
      puts "Unknown category: #{category}"
      puts "Available: #{models.keys.join(', ')}"
      exit 1
    end

    puts "Fetching prices for #{category}..."
    models[category].find_each do |part|
      PriceFetchJob.perform_later(category, part.id)
    end
    puts 'Done!'
  end
end
