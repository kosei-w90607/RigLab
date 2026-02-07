# frozen_string_literal: true

class PriceFetchAllJob < ApplicationJob
  queue_as :price_fetch

  CATEGORY_MODELS = {
    'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
    'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
    'psu' => PartsPsu, 'case' => PartsCase
  }.freeze

  def perform
    CATEGORY_MODELS.each do |part_type, model|
      model.find_each do |part|
        PriceFetchJob.perform_later(part_type, part.id)
      end
    end
  end
end
