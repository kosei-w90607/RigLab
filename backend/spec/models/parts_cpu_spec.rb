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

    describe 'memory_type validation' do
      let(:valid_cpu_attrs) do
        { name: 'Test CPU', maker: 'Intel', price: 50_000, socket: 'LGA1700', tdp: 65 }
      end

      it 'is valid with DDR4' do
        cpu = PartsCpu.new(valid_cpu_attrs.merge(memory_type: 'DDR4'))
        expect(cpu).to be_valid
      end

      it 'is valid with DDR5' do
        cpu = PartsCpu.new(valid_cpu_attrs.merge(memory_type: 'DDR5'))
        expect(cpu).to be_valid
      end

      it 'is valid with DDR4,DDR5 (both supported)' do
        cpu = PartsCpu.new(valid_cpu_attrs.merge(memory_type: 'DDR4,DDR5'))
        expect(cpu).to be_valid
      end

      it 'is invalid with unsupported memory type' do
        cpu = PartsCpu.new(valid_cpu_attrs.merge(memory_type: 'DDR3'))
        expect(cpu).not_to be_valid
        expect(cpu.errors[:memory_type]).to include(/DDR4, DDR5 のみ指定できます/)
      end
    end
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

  describe '#supports_memory_type?' do
    let(:ddr5_only_cpu) do
      PartsCpu.new(
        name: 'AMD Ryzen 7 7700X',
        maker: 'AMD',
        price: 50_000,
        socket: 'AM5',
        tdp: 105,
        memory_type: 'DDR5'
      )
    end

    let(:dual_memory_cpu) do
      PartsCpu.new(
        name: 'Intel Core i7-14700F',
        maker: 'Intel',
        price: 56_000,
        socket: 'LGA1700',
        tdp: 65,
        memory_type: 'DDR4,DDR5'
      )
    end

    it 'returns true for supported single memory type' do
      expect(ddr5_only_cpu.supports_memory_type?('DDR5')).to be true
    end

    it 'returns false for unsupported memory type' do
      expect(ddr5_only_cpu.supports_memory_type?('DDR4')).to be false
    end

    it 'returns true for both DDR4 and DDR5 when dual supported' do
      expect(dual_memory_cpu.supports_memory_type?('DDR4')).to be true
      expect(dual_memory_cpu.supports_memory_type?('DDR5')).to be true
    end
  end
end
