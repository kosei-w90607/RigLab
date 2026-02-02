# frozen_string_literal: true

class ShareToken < ApplicationRecord
  validates :token, presence: true, uniqueness: true
  validates :parts_data, presence: true
end
