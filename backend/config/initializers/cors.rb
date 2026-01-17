Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    if Rails.env.test?
      origins '*'
    else
      origins 'http://localhost:3000'
    end

    resource '*',
             headers: :any,
             expose: ["access-token", "expiry", "token-type", "uid", "client"],
             methods: %i[get post put patch delete options head],
             credentials: !Rails.env.test?

    Rails.logger.info 'CORS headers configured' unless Rails.env.test?
  end
end
