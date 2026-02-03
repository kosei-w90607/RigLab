# frozen_string_literal: true

# Content Security Policy (CSP) 設定
# API専用アプリケーションのため最小限の設定
#
# フロントエンドはNext.jsで別途運用しているため、
# バックエンドAPIはCSPヘッダーを送信しないが、
# 将来の拡張に備えて設定を残しておく

# Rails.application.configure do
#   config.content_security_policy do |policy|
#     policy.default_src :none
#     policy.frame_ancestors :none
#   end
#
#   # レポートのみモード（開発時用）
#   # config.content_security_policy_report_only = true
# end
