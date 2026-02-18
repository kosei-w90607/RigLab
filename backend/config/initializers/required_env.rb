# 本番環境で必須の環境変数を起動時に検証する
# 未設定の場合 KeyError で即座にアプリ起動を停止する
if Rails.env.production?
  %w[
    FRONTEND_URL
    CORS_ORIGINS
    NEXTAUTH_SECRET
    MAILER_FROM
    RESEND_API_KEY
  ].each do |key|
    ENV.fetch(key)
  end
end
