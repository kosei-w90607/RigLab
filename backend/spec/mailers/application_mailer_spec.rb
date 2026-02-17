require "rails_helper"

RSpec.describe ApplicationMailer do
  it "has a default from address" do
    expect(described_class.default[:from]).to eq("noreply@riglab.example.com")
  end
end
