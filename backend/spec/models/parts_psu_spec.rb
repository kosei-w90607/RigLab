# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PartsPsu, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:maker) }
    it { should validate_presence_of(:price) }
    it { should validate_presence_of(:wattage) }
    it { should validate_presence_of(:form_factor) }

    it { should validate_numericality_of(:price).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:wattage).only_integer.is_greater_than(0) }
    it { should validate_inclusion_of(:form_factor).in_array(%w[ATX SFX]) }
  end

  describe 'associations' do
    it { should have_many(:pc_entrust_sets).with_foreign_key(:psu_id).dependent(:nullify) }
    it { should have_many(:pc_custom_sets).with_foreign_key(:psu_id).dependent(:nullify) }
  end
end
