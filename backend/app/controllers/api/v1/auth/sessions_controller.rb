# frozen_string_literal: true

module Api
  module V1
    module Auth
      class SessionsController < ApplicationController
        skip_before_action :set_current_user_from_jwt, only: [:create]

        # POST /api/v1/auth/login
        # Authenticate user and return user data for NextAuth.js
        def create
          user = User.authenticate(login_params[:email], login_params[:password])

          if user
            render json: {
              id: user.id.to_s,
              email: user.email,
              name: user.name,
              role: user.role
            }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end

        # GET /api/v1/auth/me
        # Get current user info (requires JWT)
        def me
          authenticate_user!
          return if performed?

          render json: {
            id: current_user.id.to_s,
            email: current_user.email,
            name: current_user.name,
            role: current_user.role
          }, status: :ok
        end

        private

        def login_params
          params.require(:user).permit(:email, :password)
        end
      end
    end
  end
end
