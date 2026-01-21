# frozen_string_literal: true

# JWT認証concern（NextAuth.js連携用）
module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :set_current_user_from_jwt
  end

  private

  # AuthorizationヘッダーからJWTを取得・検証してユーザーを設定
  def set_current_user_from_jwt
    @current_user = nil
    token = extract_token_from_header
    return unless token

    payload = decode_jwt(token)
    return unless payload

    @current_user = User.find_by(id: payload['sub'])
  end

  # 現在の認証済みユーザーを取得
  def current_user
    @current_user
  end

  # ユーザーがログイン中かどうか
  def user_signed_in?
    current_user.present?
  end

  # 認証必須（未認証なら401を返す）
  def authenticate_user!
    return if user_signed_in?

    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  # 管理者権限必須（権限なしなら403を返す）
  def require_admin!
    authenticate_user!
    return if performed?
    return if current_user&.admin?

    render json: { error: 'Forbidden' }, status: :forbidden
  end

  # AuthorizationヘッダーからBearerトークンを抽出
  def extract_token_from_header
    auth_header = request.headers['Authorization']
    return nil unless auth_header&.start_with?('Bearer ')

    auth_header.split(' ').last
  end

  # JWTをデコード・検証（NextAuth.jsはNEXTAUTH_SECRETで署名）
  def decode_jwt(token)
    secret = jwt_secret
    return nil unless secret

    JWT.decode(
      token,
      secret,
      true,
      {
        algorithm: 'HS256',
        verify_expiration: true
      }
    ).first
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError => e
    Rails.logger.warn "JWT検証失敗: #{e.message}"
    nil
  end

  # JWT署名用シークレット（フロントエンドのNEXTAUTH_SECRETと同じ値）
  def jwt_secret
    ENV.fetch('NEXTAUTH_SECRET', nil)
  end
end
