class ApplicationController < ActionController::API
  # JWT認証（NextAuth.js連携）
  include JwtAuthenticatable

  def health_check
    render json: { status: "ok" }
  end
end
