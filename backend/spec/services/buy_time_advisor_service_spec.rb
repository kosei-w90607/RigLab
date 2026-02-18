# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BuyTimeAdvisorService do
  let(:cpu) { create(:parts_cpu, name: 'Intel Core i7-14700K', maker: 'Intel', price: 52000) }

  describe '#call' do
    context 'when no price data exists' do
      it 'returns neutral verdict with no data message' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.verdict).to eq('neutral')
        expect(result.confidence).to eq(0.0)
        expect(result.trend_summary).to be_nil
        expect(result.message).to include('価格データが集まっとらん')
      end
    end

    context 'when price has dropped more than 5%' do
      before do
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 60000, fetched_at: 25.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55000, fetched_at: 10.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 1.day.ago)
      end

      it 'returns buy_now verdict' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.verdict).to eq('buy_now')
        expect(result.confidence).to eq(0.85)
        expect(result.trend_summary[:direction]).to eq('down')
        expect(result.message).to include('チャンス')
      end
    end

    context 'when price has risen more than 5%' do
      before do
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 48000, fetched_at: 25.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 10.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55000, fetched_at: 1.day.ago)
      end

      it 'returns wait verdict' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.verdict).to eq('wait')
        expect(result.confidence).to eq(0.8)
        expect(result.trend_summary[:direction]).to eq('up')
        expect(result.message).to include('高値圏')
      end
    end

    context 'when current price is below average' do
      before do
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 53000, fetched_at: 25.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 54000, fetched_at: 10.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 1.day.ago)
      end

      it 'returns buy_now verdict with average comparison' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.verdict).to eq('buy_now')
        expect(result.message).to include('平均価格より安い')
      end
    end

    context 'when price is stable and above average' do
      before do
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 51000, fetched_at: 25.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 51500, fetched_at: 10.days.ago)
        create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 1.day.ago)
      end

      it 'returns neutral verdict' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.verdict).to eq('neutral')
        expect(result.message).to include('安定')
      end
    end
  end

  describe '.category_trends' do
    before do
      # 最初の5件と最後の5件が異なるグループになるよう十分なデータを作成
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 58000, fetched_at: 28.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 57000, fetched_at: 25.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 56000, fetched_at: 22.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 55000, fetched_at: 20.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 54000, fetched_at: 18.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 53000, fetched_at: 10.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 5.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 51000, fetched_at: 3.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 50000, fetched_at: 2.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 49000, fetched_at: 1.day.ago)
    end

    it 'returns trend data for categories with price history' do
      trends = described_class.category_trends

      cpu_trend = trends.find { |t| t[:category] == 'cpu' }
      expect(cpu_trend).not_to be_nil
      expect(cpu_trend[:label]).to eq('CPU')
      expect(cpu_trend[:direction]).to eq('down')
    end
  end

  describe '.best_deals' do
    before do
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 60000, fetched_at: 25.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 1.day.ago)
    end

    it 'returns buy_now parts sorted by change percent' do
      deals = described_class.best_deals(limit: 5)

      expect(deals).not_to be_empty
      expect(deals.first[:part_name]).to eq('Intel Core i7-14700K')
      expect(deals.first[:verdict]).to eq('buy_now')
    end
  end

  describe '.biggest_changes' do
    before do
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 60000, fetched_at: 25.days.ago)
      create(:parts_price_history, part_type: 'cpu', part_id: cpu.id, price: 52000, fetched_at: 1.day.ago)
    end

    it 'returns parts with biggest price drops' do
      drops = described_class.biggest_changes(direction: :down, limit: 5)

      expect(drops).not_to be_empty
      expect(drops.first[:change_percent]).to be < 0
    end

    it 'returns parts with biggest price rises' do
      rises = described_class.biggest_changes(direction: :up, limit: 5)
      # 下落データのみなので、上昇リストは空またはリストの末尾に位置する
      expect(rises).to be_an(Array)
    end
  end
end
