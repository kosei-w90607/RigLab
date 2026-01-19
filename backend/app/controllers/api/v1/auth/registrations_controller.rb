# frozen_string_literal: true

module Api
  module V1
    module Auth
      class RegistrationsController < ApplicationController
        skip_before_action :set_current_user_from_jwt

        # POST /api/v1/auth/register
        # Create new user account
        def create
          user = User.new(registration_params)
          user.role = 'user' # Force default role
          user.confirmed_at = Time.current # Auto-confirm for now (TODO: email verification)

          if user.save
            render json: {
              id: user.id.to_s,
              email: user.email,
              name: user.name,
              role: user.role
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def registration_params
          params.require(:user).permit(:email, :password, :name)
        end
      end
    end
  end
end
