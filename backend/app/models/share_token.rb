# frozen_string_literal: true

class ShareToken < ApplicationRecord
  validates :token, presence: true, uniqueness: true
  validates :parts_data, presence: true

  before_validation :generate_token, on: :create

  def cpu
    PartsCpu.find_by(id: parts_data['cpu_id'])
  end

  def gpu
    PartsGpu.find_by(id: parts_data['gpu_id'])
  end

  def memory
    PartsMemory.find_by(id: parts_data['memory_id'])
  end

  def storage1
    PartsStorage.find_by(id: parts_data['storage1_id'])
  end

  def storage2
    PartsStorage.find_by(id: parts_data['storage2_id'])
  end

  def storage3
    PartsStorage.find_by(id: parts_data['storage3_id'])
  end

  def os
    PartsOs.find_by(id: parts_data['os_id'])
  end

  def motherboard
    PartsMotherboard.find_by(id: parts_data['motherboard_id'])
  end

  def psu
    PartsPsu.find_by(id: parts_data['psu_id'])
  end

  def case_part
    PartsCase.find_by(id: parts_data['case_id'])
  end

  def total_price
    [cpu, gpu, memory, storage1, storage2, storage3, os, motherboard, psu, case_part]
      .compact
      .sum(&:price)
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(16)
  end
end
