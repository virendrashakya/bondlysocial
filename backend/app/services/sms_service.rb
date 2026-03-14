class SmsService
  def self.send_otp(phone:, otp:)
    # In development, just log the OTP (no real SMS)
    if Rails.env.development?
      Rails.logger.info ">>> OTP for #{phone}: #{otp} <<<"
      return
    end

    client = Twilio::REST::Client.new(
      ENV["TWILIO_ACCOUNT_SID"],
      ENV["TWILIO_AUTH_TOKEN"]
    )

    client.messages.create(
      from: ENV["TWILIO_PHONE_NUMBER"],
      to:   phone,
      body: "Your IntentConnect code: #{otp}. Valid for 10 minutes."
    )
  end
end
