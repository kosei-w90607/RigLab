class AuthMailer < ApplicationMailer
  def password_reset(user, token)
    @user = user
    @reset_url = "#{frontend_url}/reset-password?token=#{token}"
    mail(to: @user.email, subject: "RigLab パスワードリセットのお知らせ")
  end

  def email_confirmation(user, token)
    @user = user
    @confirm_url = "#{frontend_url}/verify-email?token=#{token}"
    mail(to: @user.email, subject: "RigLab メールアドレスの確認")
  end

  private

  def frontend_url
    ENV.fetch("FRONTEND_URL")
  end
end
