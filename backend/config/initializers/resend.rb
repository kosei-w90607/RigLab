Resend.api_key = ENV["RESEND_API_KEY"]

if Resend.api_key.blank? && Rails.env.production?
  Rails.logger.warn("WARNING: RESEND_API_KEY is not set. Email delivery will fail.")
end
