# frozen_string_literal: true

class PriceFetchJob < ApplicationJob
  queue_as :price_fetch

  def perform(part_type, part_id)
    PriceFetchService.new(part_type: part_type, part_id: part_id).call
  end
end
