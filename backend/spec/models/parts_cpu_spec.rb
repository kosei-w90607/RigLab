# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PartsCpu, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:maker) }
    it { should validate_presence_of(:price) }
    it { should validate_presence_of(:socket) }
    it { should validate_presence_of(:tdp) }
    it { should validate_presence_of(:memory_type) }

    it { should validate_numericality_of(:price).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:tdp).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_inclusion_of(:memory_type).in_array(%w[DDR4 DDR5]) }
  end

  describe 'associations' do
    it { should have_many(:pc_entrust_sets).with_foreign_key(:cpu_id).dependent(:nullify) }
    it { should have_many(:pc_custom_sets).with_foreign_key(:cpu_id).dependent(:nullify) }
  end

  describe 'creation' do
    it 'creates a valid CPU' do
      cpu = PartsCpu.new(
        name: 'Intel Core i7-14700K',
        maker: 'Intel',
        price: 52_000,
        socket: 'LGA1700',
        tdp: 125,
        memory_type: 'DDR5',
        specs: { cores: 20, threads: 28 }
      )
      expect(cpu).to be_valid
    end
  end
end
