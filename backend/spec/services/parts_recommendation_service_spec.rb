# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PartsRecommendationService do
  describe '#call' do
    context 'プリセットが存在する場合' do
      before do
        # 予算帯・用途別にプリセットを作成
        create(:pc_entrust_set, budget_range: 'entry', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'middle', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'high', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'entry', use_case: 'creative')
        create(:pc_entrust_set, budget_range: 'middle', use_case: 'creative')
        create(:pc_entrust_set, budget_range: 'entry', use_case: 'office')
      end

      context '予算と用途の両方を指定した場合' do
        it 'マッチするプリセットを返す' do
          service = described_class.new(budget: 'middle', use_case: 'gaming')
          result = service.call

          expect(result.success?).to be true
          expect(result.presets.length).to eq(1)
          expect(result.presets.first.budget_range).to eq('middle')
          expect(result.presets.first.use_case).to eq('gaming')
        end
      end

      context '予算のみ指定した場合' do
        it 'その予算帯の全用途のプリセットを返す' do
          service = described_class.new(budget: 'entry')
          result = service.call

          expect(result.success?).to be true
          expect(result.presets.length).to eq(3) # gaming, creative, office
          expect(result.presets.all? { |p| p.budget_range == 'entry' }).to be true
        end
      end

      context '用途のみ指定した場合' do
        it 'その用途の全予算帯のプリセットを返す' do
          service = described_class.new(use_case: 'gaming')
          result = service.call

          expect(result.success?).to be true
          expect(result.presets.length).to eq(3) # entry, middle, high
          expect(result.presets.all? { |p| p.use_case == 'gaming' }).to be true
        end
      end

      context '何も指定しない場合' do
        it '全プリセットを返す' do
          service = described_class.new
          result = service.call

          expect(result.success?).to be true
          expect(result.presets.length).to eq(6)
        end
      end
    end

    context 'マッチするプリセットが存在しない場合' do
      it '空の結果を返す（失敗ではない）' do
        service = described_class.new(budget: 'high', use_case: 'office')
        result = service.call

        expect(result.success?).to be true
        expect(result.presets).to be_empty
      end
    end

    context '具体的な予算金額を指定した場合' do
      before do
        # total_priceが異なるプリセットを作成
        create(:pc_entrust_set, budget_range: 'entry', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'middle', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'high', use_case: 'gaming')
      end

      it '予算内のプリセットのみを返す' do
        service = described_class.new(max_price: 150_000, use_case: 'gaming')
        result = service.call

        expect(result.success?).to be true
        expect(result.presets.all? { |p| p.total_price <= 150_000 }).to be true
      end

      it '最小予算以上のプリセットのみを返す' do
        service = described_class.new(min_price: 200_000, use_case: 'gaming')
        result = service.call

        expect(result.success?).to be true
        expect(result.presets.all? { |p| p.total_price >= 200_000 }).to be true
      end

      it '予算範囲内のプリセットを返す' do
        service = described_class.new(min_price: 100_000, max_price: 250_000)
        result = service.call

        expect(result.success?).to be true
        expect(result.presets.all? { |p| p.total_price >= 100_000 && p.total_price <= 250_000 }).to be true
      end
    end

    context '不正なパラメータの場合' do
      it '不正な予算帯を指定するとエラーを返す' do
        service = described_class.new(budget: 'invalid')
        result = service.call

        expect(result.success?).to be false
        expect(result.error).to include('予算帯')
      end

      it '不正な用途を指定するとエラーを返す' do
        service = described_class.new(use_case: 'invalid')
        result = service.call

        expect(result.success?).to be false
        expect(result.error).to include('用途')
      end
    end

    context 'ソート順' do
      before do
        create(:pc_entrust_set, budget_range: 'high', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'entry', use_case: 'gaming')
        create(:pc_entrust_set, budget_range: 'middle', use_case: 'gaming')
      end

      it 'デフォルトで価格の昇順でソートされる' do
        service = described_class.new(use_case: 'gaming')
        result = service.call

        prices = result.presets.map(&:total_price)
        expect(prices).to eq(prices.sort)
      end

      it 'sort: :desc で価格の降順でソートできる' do
        service = described_class.new(use_case: 'gaming', sort: :desc)
        result = service.call

        prices = result.presets.map(&:total_price)
        expect(prices).to eq(prices.sort.reverse)
      end
    end
  end
end
