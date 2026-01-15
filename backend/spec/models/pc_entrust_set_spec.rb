# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PcEntrustSet, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:budget_range) }
    it { should validate_presence_of(:use_case) }

    it { should validate_inclusion_of(:budget_range).in_array(%w[entry middle high]) }
    it { should validate_inclusion_of(:use_case).in_array(%w[gaming creative office]) }
  end

  describe 'associations' do
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

  describe '#total_price' do
    it 'calculates total price of all parts' do
      cpu = PartsCpu.create!(name: 'CPU', maker: 'Intel', price: 50_000, socket: 'LGA1700', tdp: 125, memory_type: 'DDR5')
      gpu = PartsGpu.create!(name: 'GPU', maker: 'NVIDIA', price: 80_000, tdp: 200)

      preset = PcEntrustSet.create!(
        name: 'Gaming PC',
        budget_range: 'middle',
        use_case: 'gaming',
        cpu: cpu,
        gpu: gpu
      )

      expect(preset.total_price).to eq(130_000)
    end
  end
end
