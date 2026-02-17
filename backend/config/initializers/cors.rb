Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    if Rails.env.test?
      origins '*'
    elsif Rails.env.production?
      allowed = ENV.fetch('CORS_ORIGINS', '').split(',').map(&:strip)
      origins(*allowed) if allowed.any?
    else
      origins 'http://localhost:3000', 'http://localhost:3002'
    end

    resource '*',
             headers: :any,
             methods: %i[get post put patch delete options head],
             credentials: !Rails.env.test?

    Rails.logger.info 'CORS headers configured' unless Rails.env.test?
  end
end
