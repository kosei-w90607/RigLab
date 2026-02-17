# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Rack::Attack configuration" do
  describe "password reset throttle" do
    it "password_reset/email throttle が定義されている" do
      throttle = Rack::Attack.throttles["password_reset/email"]
      expect(throttle).to be_present
    end

    it "同一メール 3回/時間の制限" do
      throttle = Rack::Attack.throttles["password_reset/email"]
      expect(throttle.limit).to eq(3)
      expect(throttle.period).to eq(1.hour.to_i)
    end
  end
end
