require "rails_helper"

RSpec.describe "Resend configuration" do
  it "configures Resend API key from environment variable" do
    expect(Resend.api_key).to eq(ENV["RESEND_API_KEY"])
  end
end
