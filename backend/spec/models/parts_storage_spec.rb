# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PartsStorage, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:maker) }
    it { should validate_presence_of(:price) }

    it { should validate_numericality_of(:price).only_integer.is_greater_than_or_equal_to(0) }
  end
end
