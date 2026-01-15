# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PartsGpu, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:maker) }
    it { should validate_presence_of(:price) }
    it { should validate_presence_of(:tdp) }

    it { should validate_numericality_of(:price).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:tdp).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:length_mm).only_integer.is_greater_than(0).allow_nil }
  end

  describe 'associations' do
    it { should have_many(:pc_entrust_sets).with_foreign_key(:gpu_id).dependent(:nullify) }
    it { should have_many(:pc_custom_sets).with_foreign_key(:gpu_id).dependent(:nullify) }
  end

  describe 'creation' do
    it 'creates a valid GPU' do
      gpu = PartsGpu.new(
        name: 'GeForce RTX 4070',
        maker: 'NVIDIA',
        price: 85_000,
        tdp: 200,
        length_mm: 285,
        specs: { vram: '12GB' }
      )
      expect(gpu).to be_valid
    end
  end
end
