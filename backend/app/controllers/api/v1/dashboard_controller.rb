# frozen_string_literal: true

class Api::V1::DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: { message: "Welcome to your dashboard!", user: current_user.email }
  end
end
