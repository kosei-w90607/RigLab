# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PriceFetchAllJob, type: :job do
  before do
    ActiveJob::Base.queue_adapter = :test
  end

  it '全パーツタイプの個別ジョブをエンキューする' do
    create(:parts_cpu)
    create(:parts_gpu)

    expect {
      described_class.perform_now
    }.to have_enqueued_job(PriceFetchJob).at_least(2).times
  end
end
