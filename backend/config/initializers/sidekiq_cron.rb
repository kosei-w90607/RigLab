# frozen_string_literal: true

if Sidekiq.server? && defined?(Sidekiq::Cron)
  Sidekiq::Cron::Job.load_from_hash(
    'price_fetch_all' => {
      'cron' => '0 3 * * *',
      'class' => 'PriceFetchAllJob',
      'queue' => 'price_fetch'
    }
  )
end
