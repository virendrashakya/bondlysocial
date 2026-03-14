class UserMailer < ApplicationMailer
  def otp_email(user, otp)
    @user = user
    @otp  = otp
    mail(to: user.email, subject: "Your IntentConnect verification code")
  end
end
