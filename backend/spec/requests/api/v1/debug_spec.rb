# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Debug' do
  it 'shows response body' do
    get '/api/v1/parts'
    puts "Status: #{response.status}"
    puts "Body: #{response.body}"
    puts "Headers: #{response.headers.to_h}"
  end
end
