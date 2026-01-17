# frozen_string_literal: true

class CompatibilityCheckService
  # フォームファクタの互換性マッピング
  # ケースが対応できるマザーボードのform_factor一覧
  CASE_MOTHERBOARD_COMPATIBILITY = {
    'ATX' => %w[ATX mATX ITX],
    'mATX' => %w[mATX ITX],
    'ITX' => %w[ITX]
  }.freeze

  Result = Struct.new(:success?, :issues, keyword_init: true)

  Issue = Struct.new(:type, :message, :parts, keyword_init: true)

  def initialize(parts = {})
    @cpu = parts[:cpu]
    @gpu = parts[:gpu]
    @memory = parts[:memory]
    @motherboard = parts[:motherboard]
    @psu = parts[:psu]
    @pc_case = parts[:pc_case]
    @issues = []
  end

  def call
    check_cpu_motherboard_compatibility
    check_memory_motherboard_compatibility
    check_gpu_case_compatibility
    check_motherboard_case_compatibility
    check_motherboard_psu_compatibility

    Result.new(success?: @issues.empty?, issues: @issues)
  end

  private

  def check_cpu_motherboard_compatibility
    return unless @cpu && @motherboard

    # ソケット互換性
    if @cpu.socket != @motherboard.socket
      @issues << Issue.new(
        type: :cpu_motherboard_socket,
        message: "CPUソケット(#{@cpu.socket})とマザーボードソケット(#{@motherboard.socket})が一致しません",
        parts: { cpu: @cpu, motherboard: @motherboard }
      )
    end

    # メモリタイプ互換性
    return unless @cpu.memory_type != @motherboard.memory_type

    @issues << Issue.new(
      type: :cpu_motherboard_memory_type,
      message: "CPUの対応メモリ(#{@cpu.memory_type})とマザーボードの対応メモリ(#{@motherboard.memory_type})が一致しません",
      parts: { cpu: @cpu, motherboard: @motherboard }
    )
  end

  def check_memory_motherboard_compatibility
    return unless @memory && @motherboard
    return if @memory.memory_type == @motherboard.memory_type

    @issues << Issue.new(
      type: :memory_motherboard,
      message: "メモリタイプ(#{@memory.memory_type})がマザーボード(#{@motherboard.memory_type})に対応していません",
      parts: { memory: @memory, motherboard: @motherboard }
    )
  end

  def check_gpu_case_compatibility
    return unless @gpu && @pc_case
    return if @gpu.length_mm.nil? || @pc_case.max_gpu_length_mm.nil?
    return if @gpu.length_mm <= @pc_case.max_gpu_length_mm

    @issues << Issue.new(
      type: :gpu_case_length,
      message: "GPU長(#{@gpu.length_mm}mm)がケースの最大GPU長(#{@pc_case.max_gpu_length_mm}mm)を超えています",
      parts: { gpu: @gpu, pc_case: @pc_case }
    )
  end

  def check_motherboard_case_compatibility
    return unless @motherboard && @pc_case

    compatible_form_factors = CASE_MOTHERBOARD_COMPATIBILITY[@pc_case.form_factor] || []

    return if compatible_form_factors.include?(@motherboard.form_factor)

    @issues << Issue.new(
      type: :motherboard_case,
      message: "マザーボード(#{@motherboard.form_factor})がケース(#{@pc_case.form_factor})に対応していません",
      parts: { motherboard: @motherboard, pc_case: @pc_case }
    )
  end

  def check_motherboard_psu_compatibility
    return unless @motherboard && @psu

    # SFX電源はアダプタで全てに対応可能
    return if @psu.form_factor == 'SFX'

    # ATX電源はATXマザーボードに対応（mATX/ITXも物理的には対応可能だが、ケースとの兼ね合いで問題なし）
    # 基本的にATX電源は全てのマザーボードに対応
    nil
  end
end
