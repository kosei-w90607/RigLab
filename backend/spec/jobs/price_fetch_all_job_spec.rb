# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PriceFetchAllJob, type: :job do
  it '全パーツの価格を取得して結果を集計する' do
    cpu = create(:parts_cpu)
    gpu = create(:parts_gpu)

    success_result = PriceFetchService::Result.new(success?: true, price_history: nil, error: nil)

    allow(PriceFetchService).to receive(:new).and_return(
      instance_double(PriceFetchService, call: success_result)
    )

    result = described_class.perform_now

    expect(PriceFetchService).to have_received(:new).with(part_type: 'cpu', part_id: cpu.id)
    expect(PriceFetchService).to have_received(:new).with(part_type: 'gpu', part_id: gpu.id)
    expect(result[:total]).to eq(2)
    expect(result[:success]).to eq(2)
    expect(result[:failed]).to eq(0)
  end

  it '失敗した場合もエラーを集計する' do
    create(:parts_cpu)

    failure_result = PriceFetchService::Result.new(success?: false, price_history: nil, error: '検索結果がありません')

    allow(PriceFetchService).to receive(:new).and_return(
      instance_double(PriceFetchService, call: failure_result)
    )

    result = described_class.perform_now

    expect(result[:failed]).to eq(1)
    expect(result[:errors].first).to include('検索結果がありません')
  end
end
