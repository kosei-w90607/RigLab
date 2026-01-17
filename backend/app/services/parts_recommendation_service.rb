# frozen_string_literal: true

class PartsRecommendationService
  VALID_BUDGETS = %w[entry middle high].freeze
  VALID_USE_CASES = %w[gaming creative office].freeze

  Result = Struct.new(:success?, :presets, :error, keyword_init: true)

  def initialize(budget: nil, use_case: nil, min_price: nil, max_price: nil, sort: :asc)
    @budget = budget
    @use_case = use_case
    @min_price = min_price&.to_i
    @max_price = max_price&.to_i
    @sort = sort
  end

  def call
    return validation_error if validation_failed?

    presets = fetch_presets.to_a
    presets = apply_price_filters(presets)
    presets = apply_sort(presets)

    Result.new(success?: true, presets: presets, error: nil)
  end

  private

  def validation_failed?
    @validation_error = nil

    if @budget.present? && !VALID_BUDGETS.include?(@budget)
      @validation_error = "不正な予算帯です: #{@budget}"
      return true
    end

    if @use_case.present? && !VALID_USE_CASES.include?(@use_case)
      @validation_error = "不正な用途です: #{@use_case}"
      return true
    end

    false
  end

  def validation_error
    Result.new(success?: false, presets: [], error: @validation_error)
  end

  def fetch_presets
    presets = PcEntrustSet.all
    presets = presets.where(budget_range: @budget) if @budget.present?
    presets = presets.where(use_case: @use_case) if @use_case.present?
    presets
  end

  def apply_price_filters(presets)
    presets = presets.select { |p| p.total_price >= @min_price } if @min_price.present?
    presets = presets.select { |p| p.total_price <= @max_price } if @max_price.present?
    presets
  end

  def apply_sort(presets)
    case @sort
    when :desc
      presets.sort_by(&:total_price).reverse
    else
      presets.sort_by(&:total_price)
    end
  end
end
