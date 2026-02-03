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

  ### Blocklist Login Attacks ###

  # ログイン試行制限: 5回失敗で15分ロック（IP単位）
  # メモリストアを使用（本番ではRedis推奨）
  blocklist('fail2ban/login') do |req|
    # ログインエンドポイントへのPOSTリクエストのみ対象
    Rack::Attack::Fail2Ban.filter(
      "login-#{req.ip}",
      maxretry: 5,
      findtime: 1.minute,
      bantime: 15.minutes
    ) do
      req.path == '/api/v1/auth/login' && req.post?
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

  ### Custom Blocklist Response ###
  self.blocklisted_responder = lambda do |_env|
    [
      429,
      { 'Content-Type' => 'application/json' },
      [{ error: 'ログイン試行回数が上限に達しました。15分後にお試しください。' }.to_json]
    ]
  end
end
