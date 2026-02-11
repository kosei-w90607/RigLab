# frozen_string_literal: true

class PriceFetchAllJob < ApplicationJob
  queue_as :price_fetch

  CATEGORY_MODELS = {
    'cpu' => PartsCpu, 'gpu' => PartsGpu, 'memory' => PartsMemory,
    'storage' => PartsStorage, 'os' => PartsOs, 'motherboard' => PartsMotherboard,
    'psu' => PartsPsu, 'case' => PartsCase
  }.freeze

  def perform
    results = { total: 0, success: 0, failed: 0, errors: [] }

    CATEGORY_MODELS.each do |part_type, model|
      model.find_each do |part|
        results[:total] += 1
        result = PriceFetchJob.perform_now(part_type, part.id)
        if result&.success?
          results[:success] += 1
        else
          results[:failed] += 1
          results[:errors] << "#{part_type}##{part.id}: #{result&.error || 'unknown'}"
        end
      end
    end

    results[:errors] = results[:errors].first(20)
    results
  end
end
