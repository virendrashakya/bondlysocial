class OtpDeliveryJob < ApplicationJob
  queue_as :critical

  def perform(user_id:, otp:, channel: :sms)
    user = User.find_by(id: user_id)
    return unless user

    case channel.to_sym
    when :sms
      SmsService.send_otp(phone: user.phone, otp: otp)
    when :email
      UserMailer.otp_email(user, otp).deliver_now
    end
  end
end
