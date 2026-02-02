# frozen_string_literal: true

module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        before_action :require_admin!
        before_action :set_user, only: %i[update]

        def index
          users = User.order(created_at: :desc).page(page_param).per(per_page_param)

          render json: {
            data: users.map { |user| serialize_user(user) },
            meta: {
              total: users.total_count,
              page: users.current_page,
              per_page: users.limit_value
            }
          }
        end

        def update
          unless User::ROLES.include?(params[:role])
            return render json: {
              error: { code: 'VALIDATION_ERROR', message: '無効なロールです' }
            }, status: :unprocessable_entity
          end

          if @user.update(role: params[:role])
            render json: { data: serialize_user(@user) }
          else
            render json: {
              error: { code: 'VALIDATION_ERROR', message: @user.errors.full_messages.join(', ') }
            }, status: :unprocessable_entity
          end
        end

        private

        def set_user
          @user = User.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: { code: 'NOT_FOUND', message: 'ユーザーが見つかりません' } }, status: :not_found
        end

        def serialize_user(user)
          {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            confirmed: user.confirmed?,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        end

        def page_param
          params[:page] || 1
        end

        def per_page_param
          params[:per_page] || 20
        end
      end
    end
  end
end
