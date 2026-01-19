# frozen_string_literal: true

# JWT-based authentication concern for NextAuth.js integration
# Replaces DeviseTokenAuth for simpler JWT verification
module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :set_current_user_from_jwt
  end

  private

  # Extract and verify JWT from Authorization header
  def set_current_user_from_jwt
    @current_user = nil
    token = extract_token_from_header
    return unless token

    payload = decode_jwt(token)
    return unless payload

    @current_user = User.find_by(id: payload['sub'])
  end

  # Get current authenticated user
  def current_user
    @current_user
  end

  # Check if user is signed in
  def user_signed_in?
    current_user.present?
  end

  # Require authentication - returns 401 if not authenticated
  def authenticate_user!
    return if user_signed_in?

    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  # Require admin role
  def require_admin!
    authenticate_user!
    return if performed?
    return if current_user&.admin?

    render json: { error: 'Forbidden' }, status: :forbidden
  end

  # Extract Bearer token from Authorization header
  def extract_token_from_header
    auth_header = request.headers['Authorization']
    return nil unless auth_header&.start_with?('Bearer ')

    auth_header.split(' ').last
  end

  # Decode and verify JWT token
  # NextAuth.js signs JWTs with the NEXTAUTH_SECRET
  def decode_jwt(token)
    secret = jwt_secret
    return nil unless secret

    JWT.decode(
      token,
      secret,
      true, # verify signature
      {
        algorithm: 'HS256',
        verify_expiration: true
      }
    ).first
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError => e
    Rails.logger.warn "JWT verification failed: #{e.message}"
    nil
  end

  # JWT secret from environment
  # Should match NEXTAUTH_SECRET in frontend
  def jwt_secret
    ENV.fetch('NEXTAUTH_SECRET', nil)
  end
end
