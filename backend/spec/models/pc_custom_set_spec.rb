# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PcCustomSet, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
  end

  describe 'associations' do
    it { should belong_to(:user).optional }
    it { should belong_to(:cpu).class_name('PartsCpu').optional }
    it { should belong_to(:gpu).class_name('PartsGpu').optional }
    it { should belong_to(:memory).class_name('PartsMemory').optional }
    it { should belong_to(:storage1).class_name('PartsStorage').optional }
    it { should belong_to(:storage2).class_name('PartsStorage').optional }
    it { should belong_to(:storage3).class_name('PartsStorage').optional }
    it { should belong_to(:os).class_name('PartsOs').optional }
    it { should belong_to(:motherboard).class_name('PartsMotherboard').optional }
    it { should belong_to(:psu).class_name('PartsPsu').optional }
    it { should belong_to(:case).class_name('PartsCase').optional }
  end

  describe 'callbacks' do
    it 'generates share_token before create' do
      build = PcCustomSet.create!(name: 'My Build')
      expect(build.share_token).to be_present
      expect(build.share_token.length).to eq(32)
    end
  end

  describe '#total_price' do
    it 'calculates total price of all parts' do
      cpu = PartsCpu.create!(name: 'CPU', maker: 'Intel', price: 50_000, socket: 'LGA1700', tdp: 125, memory_type: 'DDR5')
      storage = PartsStorage.create!(name: 'SSD', maker: 'Samsung', price: 15_000)

      build = PcCustomSet.create!(
        name: 'My Build',
        cpu: cpu,
        storage1: storage
      )

      expect(build.total_price).to eq(65_000)
    end
  end
end
