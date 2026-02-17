class AuthMailer < ApplicationMailer
  def password_reset(user, token)
    @user = user
    @reset_url = "#{frontend_url}/reset-password?token=#{token}"
    mail(to: @user.email, subject: "RigLab パスワードリセットのお知らせ")
  end

  private

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:3000")
  end
end
