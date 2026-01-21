# frozen_string_literal: true

# Helper module for JWT authentication in tests
# Generates JWT tokens compatible with NextAuth.js
module JwtHelper
  # Test secret - must match the value used in test environment
  TEST_JWT_SECRET = 'test-secret-for-rspec'

  # Generate JWT auth headers for a user
  # @param user [User] the user to authenticate
  # @return [Hash] headers hash with Authorization Bearer token
  def jwt_auth_headers(user)
    token = generate_jwt_token(user)
    { 'Authorization' => "Bearer #{token}" }
  end

  # Generate JWT token for a user
  # @param user [User] the user to generate token for
  # @return [String] JWT token
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

  # Set the NEXTAUTH_SECRET env var for tests
  config.before(:suite) do
    ENV['NEXTAUTH_SECRET'] = JwtHelper::TEST_JWT_SECRET
  end
end
