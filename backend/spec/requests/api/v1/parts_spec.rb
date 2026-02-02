# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Parts' do
  describe 'GET /api/v1/parts' do
    context 'パーツが存在する場合' do
      before do
        create_list(:parts_cpu, 3)
        create_list(:parts_gpu, 2)
      end

      it '全パーツ一覧を返す' do
        get '/api/v1/parts'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(5)
        expect(json['meta']).to include('total', 'page', 'per_page')
      end
    end

    context 'categoryでフィルタリングする場合' do
      before do
        create_list(:parts_cpu, 2)
        create_list(:parts_gpu, 3)
      end

      it 'CPUのみを返す' do
        get '/api/v1/parts', params: { category: 'cpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['category'] == 'cpu' }).to be true
      end

      it 'GPUのみを返す' do
        get '/api/v1/parts', params: { category: 'gpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(3)
        expect(json['data'].all? { |p| p['category'] == 'gpu' }).to be true
      end
    end

    context 'keywordで検索する場合' do
      before do
        create(:parts_cpu, name: 'Intel Core i7-14700K')
        create(:parts_cpu, name: 'AMD Ryzen 7 7800X3D')
        create(:parts_gpu, name: 'GeForce RTX 4070')
      end

      it '名前にキーワードを含むパーツを返す' do
        get '/api/v1/parts', params: { keyword: 'Intel' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['name']).to include('Intel')
      end
    end

    context '価格でフィルタリングする場合' do
      before do
        create(:parts_cpu, price: 30_000)
        create(:parts_cpu, price: 50_000)
        create(:parts_gpu, price: 80_000)
      end

      it '最小価格以上のパーツを返す' do
        get '/api/v1/parts', params: { min_price: 40_000 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['price'] >= 40_000 }).to be true
      end

      it '最大価格以下のパーツを返す' do
        get '/api/v1/parts', params: { max_price: 60_000 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['price'] <= 60_000 }).to be true
      end

      it '価格範囲内のパーツを返す' do
        get '/api/v1/parts', params: { min_price: 40_000, max_price: 60_000 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['price']).to eq(50_000)
      end
    end

    context 'ページネーション' do
      before do
        create_list(:parts_cpu, 25)
      end

      it 'デフォルトで20件を返す' do
        get '/api/v1/parts'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(20)
        expect(json['meta']['total']).to eq(25)
        expect(json['meta']['page']).to eq(1)
        expect(json['meta']['per_page']).to eq(20)
      end

      it 'ページ指定で取得できる' do
        get '/api/v1/parts', params: { page: 2 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(5)
        expect(json['meta']['page']).to eq(2)
      end

      it 'per_pageで件数を指定できる' do
        get '/api/v1/parts', params: { per_page: 10 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(10)
        expect(json['meta']['per_page']).to eq(10)
      end
    end

    context 'パーツが存在しない場合' do
      it '空の配列を返す' do
        get '/api/v1/parts'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']).to eq([])
        expect(json['meta']['total']).to eq(0)
      end
    end
  end

  describe 'GET /api/v1/parts with compatibility filters' do
    describe 'cpu_socket filter' do
      before do
        create(:parts_motherboard, socket: 'LGA1700')
        create(:parts_motherboard, socket: 'LGA1700')
        create(:parts_motherboard, socket: 'AM5')
      end

      it 'LGA1700でフィルタリングするとLGA1700のマザーボードのみ返す' do
        get '/api/v1/parts', params: { category: 'motherboard', cpu_socket: 'LGA1700' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['socket'] == 'LGA1700' }).to be true
      end

      it 'AM5でフィルタリングするとAM5のマザーボードのみ返す' do
        get '/api/v1/parts', params: { category: 'motherboard', cpu_socket: 'AM5' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['socket']).to eq('AM5')
      end
    end

    describe 'memory_type filter' do
      before do
        create(:parts_memory, memory_type: 'DDR5')
        create(:parts_memory, memory_type: 'DDR5')
        create(:parts_memory, memory_type: 'DDR4')
      end

      it 'DDR5でフィルタリングするとDDR5のメモリのみ返す' do
        get '/api/v1/parts', params: { category: 'memory', memory_type: 'DDR5' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['memory_type'] == 'DDR5' }).to be true
      end

      it 'DDR4でフィルタリングするとDDR4のメモリのみ返す' do
        get '/api/v1/parts', params: { category: 'memory', memory_type: 'DDR4' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['memory_type']).to eq('DDR4')
      end
    end

    describe 'form_factor filter' do
      context 'ケースの場合' do
        before do
          create(:parts_case, form_factor: 'ATX')
          create(:parts_case, form_factor: 'mATX')
          create(:parts_case, form_factor: 'ITX')
        end

        it 'ATXマザボ用にフィルタするとATXケースのみ返す' do
          get '/api/v1/parts', params: { category: 'case', form_factor: 'ATX' }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json['data'].length).to eq(1)
          expect(json['data'].first['form_factor']).to eq('ATX')
        end

        it 'mATXマザボ用にフィルタするとATX/mATXケースを返す' do
          get '/api/v1/parts', params: { category: 'case', form_factor: 'mATX' }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json['data'].length).to eq(2)
          expect(json['data'].map { |p| p['form_factor'] }).to contain_exactly('ATX', 'mATX')
        end

        it 'ITXマザボ用にフィルタすると全サイズのケースを返す' do
          get '/api/v1/parts', params: { category: 'case', form_factor: 'ITX' }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json['data'].length).to eq(3)
        end
      end

      context 'マザーボードの場合' do
        before do
          create(:parts_motherboard, form_factor: 'ATX')
          create(:parts_motherboard, form_factor: 'mATX')
          create(:parts_motherboard, form_factor: 'ITX')
        end

        it 'ATXでフィルタするとATXマザーボードのみ返す' do
          get '/api/v1/parts', params: { category: 'motherboard', form_factor: 'ATX' }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json['data'].length).to eq(1)
          expect(json['data'].first['form_factor']).to eq('ATX')
        end
      end
    end

    describe 'min_gpu_length filter' do
      before do
        create(:parts_case, max_gpu_length_mm: 400, name: 'Large Case')
        create(:parts_case, max_gpu_length_mm: 320, name: 'Medium Case')
        create(:parts_case, max_gpu_length_mm: 250, name: 'Small Case')
      end

      it '300mm以上のGPUが収まるケースのみ返す' do
        get '/api/v1/parts', params: { category: 'case', min_gpu_length: 300 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].all? { |p| p['max_gpu_length_mm'] >= 300 }).to be true
      end

      it '350mm以上のGPUが収まるケースのみ返す' do
        get '/api/v1/parts', params: { category: 'case', min_gpu_length: 350 }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'].first['name']).to eq('Large Case')
      end
    end
  end

  describe 'GET /api/v1/parts/recommendations' do
    let(:cpu) { create(:parts_cpu, socket: 'LGA1700', memory_type: 'DDR5', tdp: 125) }
    let(:memory) { create(:parts_memory, memory_type: 'DDR5') }
    let(:gpu) { create(:parts_gpu, tdp: 200, length_mm: 300) }

    before do
      # 互換性のあるマザーボード
      create(:parts_motherboard, socket: 'LGA1700', memory_type: 'DDR5', form_factor: 'ATX', price: 30_000)
      # 非互換のマザーボード
      create(:parts_motherboard, socket: 'AM5', memory_type: 'DDR5', price: 25_000)

      # 十分な容量の電源
      create(:parts_psu, wattage: 850, price: 18_000)
      create(:parts_psu, wattage: 650, price: 12_000)

      # GPUが収まるケース
      create(:parts_case, form_factor: 'ATX', max_gpu_length_mm: 350, price: 15_000)
      create(:parts_case, form_factor: 'ATX', max_gpu_length_mm: 250, price: 10_000)
    end

    context '正常系: CPU + Memory のみ' do
      it '互換性のあるマザーボードを推奨する' do
        get '/api/v1/parts/recommendations', params: { cpu_id: cpu.id, memory_id: memory.id }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['motherboard']).to be_present
        expect(json['motherboard']['socket']).to eq('LGA1700')
        expect(json['motherboard']['memory_type']).to eq('DDR5')
      end

      it 'PSUを推奨する' do
        get '/api/v1/parts/recommendations', params: { cpu_id: cpu.id, memory_id: memory.id }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['psu']).to be_present
      end
    end

    context '正常系: CPU + Memory + GPU' do
      it 'GPUのTDPを考慮した電源を推奨する' do
        get '/api/v1/parts/recommendations', params: {
          cpu_id: cpu.id,
          memory_id: memory.id,
          gpu_id: gpu.id
        }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        # TDP 125 + 200 = 325W → 必要容量 = 325 * 1.5 + 100 = 587.5W → 650W以上
        expect(json['psu']).to be_present
        expect(json['psu']['wattage']).to be >= 650
      end

      it 'GPUの長さに対応したケースを推奨する' do
        get '/api/v1/parts/recommendations', params: {
          cpu_id: cpu.id,
          memory_id: memory.id,
          gpu_id: gpu.id
        }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['case']).to be_present
        expect(json['case']['max_gpu_length_mm']).to be >= 300
      end
    end

    context '異常系: 必須パラメータ欠如' do
      it 'CPUがない場合は400エラーを返す' do
        get '/api/v1/parts/recommendations', params: { memory_id: memory.id }

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']['code']).to eq('MISSING_PARAMS')
      end

      it 'メモリがない場合は400エラーを返す' do
        get '/api/v1/parts/recommendations', params: { cpu_id: cpu.id }

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']['code']).to eq('MISSING_PARAMS')
      end

      it '両方ない場合は400エラーを返す' do
        get '/api/v1/parts/recommendations'

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']['code']).to eq('MISSING_PARAMS')
      end
    end

    context '異常系: 無効なID' do
      it '存在しないCPU IDの場合は400エラーを返す' do
        get '/api/v1/parts/recommendations', params: { cpu_id: 99999, memory_id: memory.id }

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']['code']).to eq('MISSING_PARAMS')
      end

      it '存在しないメモリIDの場合は400エラーを返す' do
        get '/api/v1/parts/recommendations', params: { cpu_id: cpu.id, memory_id: 99999 }

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']['code']).to eq('MISSING_PARAMS')
      end
    end
  end

  describe 'GET /api/v1/parts/:id' do
    context 'パーツが存在する場合' do
      let(:cpu) { create(:parts_cpu) }

      it 'パーツ詳細を返す' do
        get "/api/v1/parts/#{cpu.id}", params: { category: 'cpu' }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['id']).to eq(cpu.id)
        expect(json['data']['category']).to eq('cpu')
        expect(json['data']['name']).to eq(cpu.name)
        expect(json['data']['maker']).to eq(cpu.maker)
        expect(json['data']['price']).to eq(cpu.price)
        expect(json['data']['specs']).to be_present
      end
    end

    context 'パーツが存在しない場合' do
      it '404を返す' do
        get '/api/v1/parts/99999', params: { category: 'cpu' }

        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to be_present
      end
    end
  end
end
