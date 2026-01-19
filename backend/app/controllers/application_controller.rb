class ApplicationController < ActionController::API
  # Use JWT-based authentication for NextAuth.js integration
  include JwtAuthenticatable

  # Legacy DeviseTokenAuth support (to be removed)
  # include DeviseTokenAuth::Concerns::SetUserByToken
  # alias_method :authenticate_user!, :authenticate_api_v1_user!
  # alias_method :current_user, :current_api_v1_user
  # alias_method :user_signed_in?, :api_v1_user_signed_in?
end
