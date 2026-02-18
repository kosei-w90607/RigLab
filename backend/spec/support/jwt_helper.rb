# frozen_string_literal: true

# テスト用JWT認証ヘルパーモジュール
# NextAuth.js互換のJWTトークンを生成する
module JwtHelper
  # テスト用シークレット - テスト環境で使用する値と一致させる必要がある
  TEST_JWT_SECRET = 'test-secret-for-rspec'

  # ユーザーのJWT認証ヘッダーを生成する
  # @param user [User] 認証対象のユーザー
  # @return [Hash] Authorization Bearerトークンを含むヘッダーハッシュ
  def jwt_auth_headers(user)
    token = generate_jwt_token(user)
    { 'Authorization' => "Bearer #{token}" }
  end

  # ユーザーのJWTトークンを生成する
  # @param user [User] トークン生成対象のユーザー
  # @return [String] JWTトークン
  def generate_jwt_token(user)
    payload = {
      sub: user.id.to_s,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Time.current.to_i,
      exp: 1.hour.from_now.to_i
    }
    JWT.encode(payload, TEST_JWT_SECRET, 'HS256')
  end
end

RSpec.configure do |config|
  config.include JwtHelper, type: :request

  # テスト用にNEXTAUTH_SECRET環境変数を設定
  config.before(:suite) do
    ENV['NEXTAUTH_SECRET'] = JwtHelper::TEST_JWT_SECRET
  end
end
