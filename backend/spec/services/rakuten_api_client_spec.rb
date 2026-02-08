# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RakutenApiClient do
  let(:application_id) { 'test_application_id' }
  let(:access_key) { 'test_access_key' }
  let(:base_url) { 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601' }
  let(:ranking_url) { 'https://openapi.rakuten.co.jp/ichibaranking/api/IchibaItem/Ranking/20220601' }

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
    described_class.instance_variable_set(:@last_request_time, nil)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(application_id)
    allow(ENV).to receive(:[]).with('RAKUTEN_ACCESS_KEY').and_return(access_key)
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('RAKUTEN_ALLOWED_WEBSITE', 'https://rig-lab.vercel.app').and_return('https://rig-lab.vercel.app')
  end

  describe '.detect_category' do
    it 'CPUジャンルIDからcpuを返す' do
      expect(described_class.detect_category(211582)).to eq('cpu')
    end

    it '文字列ジャンルIDも検出する' do
      expect(described_class.detect_category('100081')).to eq('gpu')
    end

    it '不明なIDはnilを返す' do
      expect(described_class.detect_category('999999')).to be_nil
    end

    it 'nil入力はnilを返す' do
      expect(described_class.detect_category(nil)).to be_nil
    end
  end

  describe '.search' do
    context '正常検索' do
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

      it 'applicationIdとaccessKeyの両方をパラメータに含める' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('applicationId' => application_id, 'accessKey' => access_key))
          .to_return(status: 200, body: success_response_body, headers: { 'Content-Type' => 'application/json' })

        described_class.search(keyword: 'Intel')

        expect(stub).to have_been_requested
      end
    end

    context 'genreId' do
      it 'カテゴリ指定時にサブジャンルIDを送信する' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('genreId' => '211582'))
          .to_return(status: 200, body: success_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.search(keyword: 'Core i9', category: 'cpu')
        expect(stub).to have_been_requested
      end

      it 'カテゴリ未指定でもPCパーツ親ジャンルで絞る' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('genreId' => '100087'))
          .to_return(status: 200, body: success_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.search(keyword: 'RTX 4070')
        expect(stub).to have_been_requested
      end
    end

    context 'NGKeyword・imageFlag・minPrice' do
      it 'カテゴリ指定時にNGKeywordを送信する' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('NGKeyword' => /中古/))
          .to_return(status: 200, body: success_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.search(keyword: 'Core i9', category: 'cpu')
        expect(stub).to have_been_requested
      end

      it 'CPUカテゴリのNGKeywordにクーラー等のノイズワードを含む' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('NGKeyword' => /クーラー/))
          .to_return(status: 200, body: success_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.search(keyword: 'Core i9', category: 'cpu')
        expect(stub).to have_been_requested
      end

      it 'imageFlag=1を常に送信する' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('imageFlag' => '1'))
          .to_return(status: 200, body: success_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.search(keyword: 'Core i9', category: 'cpu')
        expect(stub).to have_been_requested
      end

      it 'CPUカテゴリでminPrice=5000を送信する' do
        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(query: hash_including('minPrice' => '5000'))
          .to_return(status: 200, body: success_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.search(keyword: 'Core i9', category: 'cpu')
        expect(stub).to have_been_requested
      end
    end

    context 'detected_category' do
      it 'parse_itemにdetected_categoryを含める' do
        response_with_known_genre = {
          'count' => 1,
          'Items' => [
            {
              'Item' => {
                'itemName' => 'RTX 4070',
                'itemPrice' => 80000,
                'itemUrl' => 'https://item.rakuten.co.jp/shop/gpu1',
                'mediumImageUrls' => [{ 'imageUrl' => 'https://image.rakuten.co.jp/gpu1.jpg' }],
                'shopName' => 'GPUショップ',
                'itemCode' => 'shop:gpu1',
                'genreId' => '100081'
              }
            }
          ]
        }.to_json

        stub_request(:get, /#{Regexp.escape(base_url)}/)
          .to_return(status: 200, body: response_with_known_genre,
                     headers: { 'Content-Type' => 'application/json' })

        result = described_class.search(keyword: 'RTX 4070')
        expect(result.items.first[:detected_category]).to eq('gpu')
      end
    end

    context 'RAKUTEN_APPLICATION_ID未設定' do
      before do
        allow(ENV).to receive(:[]).with('RAKUTEN_APPLICATION_ID').and_return(nil)
      end

      it 'エラーを返す' do
        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to eq 'RAKUTEN_APPLICATION_ID が設定されていません'
      end
    end

    context 'RAKUTEN_ACCESS_KEY未設定' do
      before do
        allow(ENV).to receive(:[]).with('RAKUTEN_ACCESS_KEY').and_return(nil)
      end

      it 'エラーを返す' do
        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to eq 'RAKUTEN_ACCESS_KEY が設定されていません'
      end
    end

    context 'キーワード空' do
      it 'エラーを返す' do
        result = described_class.search(keyword: '')

        expect(result.success?).to be false
        expect(result.error).to eq 'キーワードを入力してください'
      end

      it 'nilの場合もエラーを返す' do
        result = described_class.search(keyword: nil)

        expect(result.success?).to be false
        expect(result.error).to eq 'キーワードを入力してください'
      end
    end

    context 'API失敗' do
      it '楽天APIが500を返した場合エラーを返す' do
        stub_request(:get, /#{Regexp.escape(base_url)}/)
          .to_return(status: 500, body: { error_description: 'Internal Server Error' }.to_json)

        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to eq 'Internal Server Error'
      end

      it 'ネットワークエラー時にエラーを返す' do
        stub_request(:get, /#{Regexp.escape(base_url)}/)
          .to_raise(SocketError.new('Connection refused'))

        result = described_class.search(keyword: 'test')

        expect(result.success?).to be false
        expect(result.error).to include 'API接続エラー'
      end
    end

    context 'RAKUTEN_ALLOWED_WEBSITE環境変数' do
      it 'カスタムWebサイトURLをヘッダーに使用する' do
        allow(ENV).to receive(:fetch).with('RAKUTEN_ALLOWED_WEBSITE', 'https://rig-lab.vercel.app').and_return('https://custom-site.example.com')

        stub = stub_request(:get, /#{Regexp.escape(base_url)}/)
          .with(headers: { 'Referer' => 'https://custom-site.example.com/', 'Origin' => 'https://custom-site.example.com' })
          .to_return(status: 200, body: success_response_body, headers: { 'Content-Type' => 'application/json' })

        described_class.search(keyword: 'test')

        expect(stub).to have_been_requested
      end
    end
  end

  describe '.ranking' do
    let(:ranking_response_body) do
      {
        'Items' => [
          {
            'Item' => {
              'rank' => 1,
              'itemName' => 'RTX 4070 SUPER',
              'itemPrice' => 89800,
              'itemUrl' => 'https://item.rakuten.co.jp/shop/gpu1',
              'mediumImageUrls' => [{ 'imageUrl' => 'https://image.rakuten.co.jp/gpu1.jpg' }],
              'shopName' => 'GPU Shop',
              'itemCode' => 'shop:gpu1',
              'reviewCount' => 10,
              'reviewAverage' => 4.5
            }
          }
        ]
      }.to_json
    end

    context '正常取得' do
      it 'ランキングデータを返す' do
        stub_request(:get, /#{Regexp.escape(ranking_url)}/)
          .to_return(status: 200, body: ranking_response_body, headers: { 'Content-Type' => 'application/json' })

        result = described_class.ranking(category: 'gpu')

        expect(result.success?).to be true
        expect(result.items.first[:rank]).to eq 1
        expect(result.items.first[:name]).to eq 'RTX 4070 SUPER'
        expect(result.items.first[:price]).to eq 89800
      end
    end

    context 'genreId送信' do
      it 'GPUカテゴリでgenreId=100081を送信する' do
        stub = stub_request(:get, /#{Regexp.escape(ranking_url)}/)
          .with(query: hash_including('genreId' => '100081'))
          .to_return(status: 200, body: ranking_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.ranking(category: 'gpu')
        expect(stub).to have_been_requested
      end

      it 'マッピング外カテゴリはPCパーツ親ジャンルにフォールバック' do
        stub = stub_request(:get, /#{Regexp.escape(ranking_url)}/)
          .with(query: hash_including('genreId' => '100087'))
          .to_return(status: 200, body: ranking_response_body,
                     headers: { 'Content-Type' => 'application/json' })
        described_class.ranking(category: 'os')
        expect(stub).to have_been_requested
      end
    end

    context 'ノイズ除外と順位正規化' do
      it 'ランキングからノイズ商品を除外して順位を振り直す' do
        noisy_ranking = {
          'Items' => [
            { 'Item' => { 'rank' => 13, 'itemName' => 'RTX 4080 SUPER', 'itemPrice' => 150000, 'itemUrl' => 'https://example.com/1', 'mediumImageUrls' => [], 'shopName' => 'Shop', 'itemCode' => 'a', 'reviewCount' => 0, 'reviewAverage' => 0 } },
            { 'Item' => { 'rank' => 15, 'itemName' => 'GPUライザーケーブル', 'itemPrice' => 2000, 'itemUrl' => 'https://example.com/2', 'mediumImageUrls' => [], 'shopName' => 'Shop', 'itemCode' => 'b', 'reviewCount' => 0, 'reviewAverage' => 0 } },
            { 'Item' => { 'rank' => 18, 'itemName' => 'RTX 4070 Ti', 'itemPrice' => 110000, 'itemUrl' => 'https://example.com/3', 'mediumImageUrls' => [], 'shopName' => 'Shop', 'itemCode' => 'c', 'reviewCount' => 0, 'reviewAverage' => 0 } },
            { 'Item' => { 'rank' => 22, 'itemName' => '【中古】RTX 3070', 'itemPrice' => 30000, 'itemUrl' => 'https://example.com/4', 'mediumImageUrls' => [], 'shopName' => 'Shop', 'itemCode' => 'd', 'reviewCount' => 0, 'reviewAverage' => 0 } },
          ]
        }.to_json

        stub_request(:get, /#{Regexp.escape(ranking_url)}/)
          .to_return(status: 200, body: noisy_ranking, headers: { 'Content-Type' => 'application/json' })

        result = described_class.ranking(category: 'gpu')

        expect(result.items.map { |i| i[:name] }).to eq(['RTX 4080 SUPER', 'RTX 4070 Ti'])
        expect(result.items.map { |i| i[:rank] }).to eq([1, 2])
      end

      it '最大10件に絞る' do
        items = (1..15).map do |i|
          { 'Item' => { 'rank' => i, 'itemName' => "GPU #{i}", 'itemPrice' => 50000 + i * 1000, 'itemUrl' => "https://example.com/#{i}", 'mediumImageUrls' => [], 'shopName' => 'Shop', 'itemCode' => "code#{i}", 'reviewCount' => 0, 'reviewAverage' => 0 } }
        end
        ranking_body = { 'Items' => items }.to_json

        stub_request(:get, /#{Regexp.escape(ranking_url)}/)
          .to_return(status: 200, body: ranking_body, headers: { 'Content-Type' => 'application/json' })

        result = described_class.ranking(category: 'gpu')

        expect(result.items.size).to eq(10)
        expect(result.items.last[:rank]).to eq(10)
      end
    end

    context 'RAKUTEN_ACCESS_KEY未設定' do
      before do
        allow(ENV).to receive(:[]).with('RAKUTEN_ACCESS_KEY').and_return(nil)
      end

      it 'エラーを返す' do
        result = described_class.ranking(category: 'gpu')

        expect(result.success?).to be false
        expect(result.error).to eq 'RAKUTEN_ACCESS_KEY が設定されていません'
      end
    end
  end

  describe '.filter_noise' do
    it 'CPUカテゴリからクーラー・シェルケースを除外する' do
      items = [
        { name: 'Intel Core i9-14900K', price: 72800 },
        { name: 'CPUクーラー 虎徹 Mark3', price: 3500 },
        { name: 'CPUシェルケース 10個セット', price: 500 },
      ]
      result = described_class.filter_noise(items, 'cpu')
      expect(result.map { |i| i[:name] }).to eq(['Intel Core i9-14900K'])
    end

    it '中古品を除外する' do
      items = [
        { name: 'RTX 4070 新品', price: 80000 },
        { name: '【中古】RTX 3070', price: 30000 },
        { name: 'RTX 4060 訳あり品', price: 40000 },
      ]
      result = described_class.filter_noise(items, 'gpu')
      expect(result.map { |i| i[:name] }).to eq(['RTX 4070 新品'])
    end

    it '価格が最低価格未満の商品を除外する' do
      items = [
        { name: 'Core i7-14700K', price: 52800 },
        { name: 'Intel CPU 何か', price: 300 },
      ]
      result = described_class.filter_noise(items, 'cpu')
      expect(result.map { |i| i[:name] }).to eq(['Core i7-14700K'])
    end

    it 'カテゴリnilの場合はフィルタしない' do
      items = [{ name: '何か', price: 1000 }]
      expect(described_class.filter_noise(items, nil)).to eq(items)
    end
  end

  describe '.filter_results' do
    let(:items) do
      [
        { name: 'A', price: 50000, shop_name: 'パソコン工房' },
        { name: 'B', price: 40000, shop_name: '怪しいショップ' },
        { name: 'C', price: 45000, shop_name: 'ツクモ' },
      ]
    end

    it 'trusted_only: trueで信頼ショップのみ返す' do
      result = described_class.filter_results(items, trusted_only: true)
      expect(result.map { |i| i[:shop_name] }).to contain_exactly('パソコン工房', 'ツクモ')
    end

    it '信頼ショップ優先 + 価格順でソート' do
      result = described_class.filter_results(items, trusted_only: false)
      expect(result.first[:shop_name]).to eq('ツクモ')
    end
  end

  describe '.trusted_shop?' do
    it '信頼ショップ名を含む場合trueを返す' do
      expect(described_class.trusted_shop?('パソコン工房 楽天市場店')).to be true
    end

    it '信頼ショップ名を含まない場合falseを返す' do
      expect(described_class.trusted_shop?('怪しいショップ')).to be false
    end

    it 'nilの場合falseを返す' do
      expect(described_class.trusted_shop?(nil)).to be false
    end
  end
end
