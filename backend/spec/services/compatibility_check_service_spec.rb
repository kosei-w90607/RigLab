# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CompatibilityCheckService do
  describe '#call' do
    context 'パーツが何も指定されていない場合' do
      it '互換性問題なしを返す' do
        service = described_class.new({})
        result = service.call

        expect(result.success?).to be true
        expect(result.issues).to be_empty
      end
    end

    context 'CPU と マザーボード の互換性' do
      let(:cpu_ddr5_lga1700) { create(:parts_cpu, socket: 'LGA1700', memory_type: 'DDR5') }
      let(:cpu_ddr4_lga1200) { create(:parts_cpu, socket: 'LGA1200', memory_type: 'DDR4') }
      let(:motherboard_ddr5_lga1700) { create(:parts_motherboard, socket: 'LGA1700', memory_type: 'DDR5') }
      let(:motherboard_ddr4_lga1200) { create(:parts_motherboard, socket: 'LGA1200', memory_type: 'DDR4') }

      it 'socket と memory_type が一致する場合は互換性あり' do
        service = described_class.new(
          cpu: cpu_ddr5_lga1700,
          motherboard: motherboard_ddr5_lga1700
        )
        result = service.call

        expect(result.success?).to be true
        expect(result.issues).to be_empty
      end

      it 'socket が異なる場合は互換性なし' do
        service = described_class.new(
          cpu: cpu_ddr5_lga1700,
          motherboard: motherboard_ddr4_lga1200
        )
        result = service.call

        expect(result.success?).to be false
        expect(result.issues.map(&:type)).to include(:cpu_motherboard_socket)
      end

      it 'memory_type が異なる場合は互換性なし' do
        cpu_ddr4_lga1700 = create(:parts_cpu, socket: 'LGA1700', memory_type: 'DDR4')
        service = described_class.new(
          cpu: cpu_ddr4_lga1700,
          motherboard: motherboard_ddr5_lga1700
        )
        result = service.call

        expect(result.success?).to be false
        expect(result.issues.map(&:type)).to include(:cpu_motherboard_memory_type)
      end
    end

    context 'メモリ と マザーボード の互換性' do
      let(:memory_ddr5) { create(:parts_memory, memory_type: 'DDR5') }
      let(:memory_ddr4) { create(:parts_memory, memory_type: 'DDR4') }
      let(:motherboard_ddr5) { create(:parts_motherboard, memory_type: 'DDR5') }

      it 'memory_type が一致する場合は互換性あり' do
        service = described_class.new(
          memory: memory_ddr5,
          motherboard: motherboard_ddr5
        )
        result = service.call

        expect(result.success?).to be true
        expect(result.issues).to be_empty
      end

      it 'memory_type が異なる場合は互換性なし' do
        service = described_class.new(
          memory: memory_ddr4,
          motherboard: motherboard_ddr5
        )
        result = service.call

        expect(result.success?).to be false
        expect(result.issues.map(&:type)).to include(:memory_motherboard)
      end
    end

    context 'GPU と ケース の互換性' do
      let(:gpu_short) { create(:parts_gpu, length_mm: 250) }
      let(:gpu_long) { create(:parts_gpu, length_mm: 400) }
      let(:case_large) { create(:parts_case, max_gpu_length_mm: 381) }
      let(:case_small) { create(:parts_case, max_gpu_length_mm: 280) }

      it 'GPU長がケースの最大長以下なら互換性あり' do
        service = described_class.new(
          gpu: gpu_short,
          pc_case: case_large
        )
        result = service.call

        expect(result.success?).to be true
        expect(result.issues).to be_empty
      end

      it 'GPU長がケースの最大長を超える場合は互換性なし' do
        service = described_class.new(
          gpu: gpu_long,
          pc_case: case_small
        )
        result = service.call

        expect(result.success?).to be false
        expect(result.issues.map(&:type)).to include(:gpu_case_length)
      end

      it 'GPU長がnilの場合はチェックをスキップ' do
        gpu_no_length = create(:parts_gpu, length_mm: nil)
        service = described_class.new(
          gpu: gpu_no_length,
          pc_case: case_small
        )
        result = service.call

        expect(result.success?).to be true
      end

      it 'ケースの最大GPU長がnilの場合はチェックをスキップ' do
        case_no_max = create(:parts_case, max_gpu_length_mm: nil)
        service = described_class.new(
          gpu: gpu_long,
          pc_case: case_no_max
        )
        result = service.call

        expect(result.success?).to be true
      end
    end

    context 'マザーボード と ケース の互換性' do
      let(:motherboard_atx) { create(:parts_motherboard, form_factor: 'ATX') }
      let(:motherboard_matx) { create(:parts_motherboard, form_factor: 'mATX') }
      let(:motherboard_itx) { create(:parts_motherboard, form_factor: 'ITX') }
      let(:case_atx) { create(:parts_case, form_factor: 'ATX') }
      let(:case_matx) { create(:parts_case, form_factor: 'mATX') }
      let(:case_itx) { create(:parts_case, form_factor: 'ITX') }

      it 'ATXケースはATX/mATX/ITXマザーボードに対応' do
        [motherboard_atx, motherboard_matx, motherboard_itx].each do |mb|
          service = described_class.new(motherboard: mb, pc_case: case_atx)
          result = service.call
          expect(result.success?).to be(true), "ATX case should support #{mb.form_factor} motherboard"
        end
      end

      it 'mATXケースはmATX/ITXマザーボードに対応' do
        [motherboard_matx, motherboard_itx].each do |mb|
          service = described_class.new(motherboard: mb, pc_case: case_matx)
          result = service.call
          expect(result.success?).to be(true), "mATX case should support #{mb.form_factor} motherboard"
        end
      end

      it 'mATXケースはATXマザーボードに非対応' do
        service = described_class.new(motherboard: motherboard_atx, pc_case: case_matx)
        result = service.call

        expect(result.success?).to be false
        expect(result.issues.map(&:type)).to include(:motherboard_case)
      end

      it 'ITXケースはITXマザーボードのみ対応' do
        service = described_class.new(motherboard: motherboard_itx, pc_case: case_itx)
        result = service.call
        expect(result.success?).to be true
      end

      it 'ITXケースはATX/mATXマザーボードに非対応' do
        [motherboard_atx, motherboard_matx].each do |mb|
          service = described_class.new(motherboard: mb, pc_case: case_itx)
          result = service.call
          expect(result.success?).to be(false), "ITX case should not support #{mb.form_factor} motherboard"
        end
      end
    end

    context 'マザーボード と 電源 の互換性' do
      let(:motherboard_atx) { create(:parts_motherboard, form_factor: 'ATX') }
      let(:motherboard_itx) { create(:parts_motherboard, form_factor: 'ITX') }
      let(:psu_atx) { create(:parts_psu, form_factor: 'ATX') }
      let(:psu_sfx) { create(:parts_psu, form_factor: 'SFX') }

      it 'ATX電源はATXマザーボードに対応' do
        service = described_class.new(motherboard: motherboard_atx, psu: psu_atx)
        result = service.call

        expect(result.success?).to be true
      end

      it 'SFX電源は全てのマザーボードに対応（アダプタ使用）' do
        [motherboard_atx, motherboard_itx].each do |mb|
          service = described_class.new(motherboard: mb, psu: psu_sfx)
          result = service.call
          expect(result.success?).to be(true), "SFX PSU should support #{mb.form_factor} motherboard"
        end
      end
    end

    context '複数の互換性問題がある場合' do
      it '全ての問題を返す' do
        cpu = create(:parts_cpu, socket: 'LGA1700', memory_type: 'DDR5')
        memory = create(:parts_memory, memory_type: 'DDR4')
        motherboard = create(:parts_motherboard, socket: 'AM5', memory_type: 'DDR4')
        gpu = create(:parts_gpu, length_mm: 400)
        pc_case = create(:parts_case, form_factor: 'ITX', max_gpu_length_mm: 280)

        service = described_class.new(
          cpu: cpu,
          memory: memory,
          motherboard: motherboard,
          gpu: gpu,
          pc_case: pc_case
        )
        result = service.call

        expect(result.success?).to be false
        expect(result.issues.size).to be >= 3
      end
    end
  end
end
