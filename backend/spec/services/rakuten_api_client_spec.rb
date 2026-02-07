# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RakutenApiClient do
  let(:application_id) { 'test_application_id' }
  let(:base_url) { 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601' }

  let(:success_response_body) do
    {
      'count' => 2,
      'Items' => [
        {
          'Item' => {
            'itemName' => 'Intel Core i9-14900K',
            'itemPrice' => 72800,
            'itemUrl' => 'https://item.rakuten.co.jp/shop/cpu1',
            'mediumImageUrls' => [{ 'imageUrl' => 'https://image.rakuten.co.jp/cpu1.jpg' }],
            'shopName' => 'PCショップ',
            'itemCode' => 'shop:cpu1',
            'genreId' => '564500'
          }
        },
        {
          'Item' => {
            'itemName' => 'Intel Core i7-14700K',
            'itemPrice' => 52800,
            'itemUrl' => 'https://item.rakuten.co.jp/shop/cpu2',
            'mediumImageUrls' => [{ 'imageUrl' => 'https://image.rakuten.co.jp/cpu2.jpg' }],
            'shopName' => 'PCパーツ屋',
            'itemCode' => 'shop:cpu2',
            'genreId' => '564500'
          }
        }
      ]
    }.to_json
  end

  before do
    # Reset rate limit state
    described_class.instance_variable_set(:@last_request_time, nil)
  end

  describe '.search' do
    context '正常検索' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(application_id)
      end

      it 'キーワードで検索してitemsを返す' do
        stub_request(:get, /#{Regexp.escape(base_url)}/)
          .to_return(status: 200, body: success_response_body, headers: { 'Content-Type' => 'application/json' })

        result = described_class.search(keyword: 'Intel Core i9')

        expect(result.success?).to be true
        expect(result.items.length).to eq 2
        expect(result.items.first[:name]).to eq 'Intel Core i9-14900K'
        expect(result.items.first[:price]).to eq 72800
        expect(result.items.first[:url]).to eq 'https://item.rakuten.co.jp/shop/cpu1'
        expect(result.items.first[:image_url]).to eq 'https://image.rakuten.co.jp/cpu1.jpg'
        expect(result.items.first[:shop_name]).to eq 'PCショップ'
        expect(result.total_count).to eq 2
        expect(result.error).to be_nil
      end
    end

    context 'カテゴリ指定' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(application_id)
      end

      it 'cpuカテゴリのgenreIdが正しく設定される' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('genreId' => '564500'))
          .to_return(status: 200, body: success_response_body, headers: { 'Content-Type' => 'application/json' })

        described_class.search(keyword: 'Intel', category: 'cpu')

        expect(stub).to have_been_requested
      end

      it 'カテゴリ未指定時はPCパーツ全般のgenreIdが設定される' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('genreId' => '100087'))
          .to_return(status: 200, body: success_response_body, headers: { 'Content-Type' => 'application/json' })

        described_class.search(keyword: 'Intel')

        expect(stub).to have_been_requested
      end
    end

    context 'RAKUTEN_APPLICATION_ID未設定' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(nil)
      end

      it 'エラーを返す' do
        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to eq 'RAKUTEN_APPLICATION_ID が設定されていません'
        expect(result.items).to eq []
      end
    end

    context 'キーワード空' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(application_id)
      end

      it 'エラーを返す' do
        result = described_class.search(keyword: '')

        expect(result.success?).to be false
        expect(result.error).to eq 'キーワードを入力してください'
        expect(result.items).to eq []
      end

      it 'nilの場合もエラーを返す' do
        result = described_class.search(keyword: nil)

        expect(result.success?).to be false
        expect(result.error).to eq 'キーワードを入力してください'
      end
    end

    context 'API失敗' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(application_id)
      end

      it '楽天APIが500を返した場合エラーを返す' do
        stub_request(:get, /#{Regexp.escape(base_url)}/)
          .to_return(status: 500, body: { error_description: 'Internal Server Error' }.to_json)

        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to eq 'Internal Server Error'
        expect(result.items).to eq []
      end

      it 'ネットワークエラー時にエラーを返す' do
        stub_request(:get, /#{Regexp.escape(base_url)}/)
          .to_raise(SocketError.new('Connection refused'))

        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to include 'API接続エラー'
        expect(result.items).to eq []
      end
    end
  end
end
