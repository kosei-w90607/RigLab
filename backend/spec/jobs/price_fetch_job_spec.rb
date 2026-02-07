# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PriceFetchJob, type: :job do
  it 'PriceFetchServiceを呼び出す' do
    service_double = instance_double(PriceFetchService)
    allow(PriceFetchService).to receive(:new).with(part_type: 'cpu', part_id: 1).and_return(service_double)
    allow(service_double).to receive(:call)

    described_class.perform_now('cpu', 1)

    expect(service_double).to have_received(:call)
  end
end
