class ApplicationController < ActionController::API
  # JWT認証（NextAuth.js連携）
  include JwtAuthenticatable
end
