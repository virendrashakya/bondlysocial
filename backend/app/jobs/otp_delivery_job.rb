class OtpDeliveryJob < ApplicationJob
  queue_as :critical

  def perform(user_id: nil, phone: nil, email: nil, otp:, channel: :sms)
    user = User.find_by(id: user_id) if user_id

    case channel.to_sym
    when :sms
      target_phone = phone || user&.phone
      SmsService.send_otp(phone: target_phone, otp: otp) if target_phone
    when :email
      target_user = user || User.new(email: email)
      UserMailer.otp_email(target_user, otp).deliver_now if target_user.email
    end
  end
end
