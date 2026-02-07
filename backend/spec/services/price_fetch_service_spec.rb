# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PriceFetchService do
  let(:cpu) { create(:parts_cpu, name: 'Intel Core i7-14700K', maker: 'Intel') }

  describe '#call' do
    context '正常系: 楽天検索→ベストマッチ→価格履歴保存→パーツ更新' do
      let(:rakuten_items) do
        [
          { name: 'Intel Core i7-14700K BOX', price: 48_000, url: 'https://item.rakuten.co.jp/shop/i7-14700k', image_url: 'https://thumbnail.image.rakuten.co.jp/i7.jpg', shop_name: 'PCショップ', item_code: 'item001', genre_id: '564500' },
          { name: 'Intel Core i5-14600K BOX', price: 38_000, url: 'https://item.rakuten.co.jp/shop/i5-14600k', image_url: 'https://thumbnail.image.rakuten.co.jp/i5.jpg', shop_name: 'PCショップ', item_code: 'item002', genre_id: '564500' }
        ]
      end

      before do
        allow(RakutenApiClient).to receive(:search).and_return(
          RakutenApiClient::Result.new(success?: true, items: rakuten_items, total_count: 2, error: nil)
        )
      end

      it '価格履歴を保存しパーツの楽天情報を更新する' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.success?).to be true
        expect(result.price_history).to be_persisted
        expect(result.price_history.price).to eq(48_000)
        expect(result.price_history.source).to eq('rakuten')
        expect(result.price_history.part_type).to eq('cpu')
        expect(result.price_history.part_id).to eq(cpu.id)

        cpu.reload
        expect(cpu.rakuten_url).to eq('https://item.rakuten.co.jp/shop/i7-14700k')
        expect(cpu.rakuten_image_url).to eq('https://thumbnail.image.rakuten.co.jp/i7.jpg')
        expect(cpu.last_price_checked_at).to be_present
      end
    end

    context '不正なパーツタイプの場合' do
      it 'エラーを返す' do
        result = described_class.new(part_type: 'invalid', part_id: 1).call

        expect(result.success?).to be false
        expect(result.error).to include('不正なパーツタイプ')
      end
    end

    context 'パーツが存在しない場合' do
      it 'エラーを返す' do
        result = described_class.new(part_type: 'cpu', part_id: 999_999).call

        expect(result.success?).to be false
        expect(result.error).to eq('パーツが見つかりません')
      end
    end

    context '楽天API検索が失敗した場合' do
      before do
        allow(RakutenApiClient).to receive(:search).and_return(
          RakutenApiClient::Result.new(success?: false, items: [], total_count: 0, error: 'API接続エラー')
        )
      end

      it 'エラーを返す' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.success?).to be false
        expect(result.error).to eq('API接続エラー')
      end
    end

    context '楽天API検索結果が空の場合' do
      before do
        allow(RakutenApiClient).to receive(:search).and_return(
          RakutenApiClient::Result.new(success?: true, items: [], total_count: 0, error: nil)
        )
      end

      it 'エラーを返す' do
        result = described_class.new(part_type: 'cpu', part_id: cpu.id).call

        expect(result.success?).to be false
        expect(result.error).to eq('検索結果がありません')
      end
    end
  end
end
