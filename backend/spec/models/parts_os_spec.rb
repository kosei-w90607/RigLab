# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PartsOs, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:maker) }
    it { should validate_presence_of(:price) }

    it { should validate_numericality_of(:price).only_integer.is_greater_than_or_equal_to(0) }
  end

  describe 'associations' do
    it { should have_many(:pc_entrust_sets).with_foreign_key(:os_id).dependent(:nullify) }
    it { should have_many(:pc_custom_sets).with_foreign_key(:os_id).dependent(:nullify) }
  end
end
