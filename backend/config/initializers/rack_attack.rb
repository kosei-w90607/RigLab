# frozen_string_literal: true

class Rack::Attack
  # テスト環境・開発環境では無効化
  if Rails.env.test? || Rails.env.development?
    self.enabled = false
    self.cache.store = ActiveSupport::Cache::NullStore.new
  end

  ### Throttle Spammy Clients ###

  # API全般: 1分間300リクエスト（IP単位）
  throttle('req/ip', limit: 300, period: 1.minute) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # 認証エンドポイント: 1分間20リクエスト（IP単位）
  throttle('auth/ip', limit: 20, period: 1.minute) do |req|
    if req.path.start_with?('/api/v1/auth/')
      req.ip
    end
  end

  ### Password Reset Throttle ###

  # パスワードリセット: 同一メール 3回/時間
  throttle('password_reset/email', limit: 3, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/password/forgot' && req.post?
      req.params['email'].to_s.downcase.gsub(/\s+/, "").presence
    end
  end

  ### Custom Throttle Response ###
  self.throttled_responder = lambda do |_env|
    [
      429,
      { 'Content-Type' => 'application/json' },
      [{ error: 'リクエストが多すぎます。しばらくしてからお試しください。' }.to_json]
    ]
  end
end
