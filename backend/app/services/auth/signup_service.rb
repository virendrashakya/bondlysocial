module Auth
  class SignupService
    Result = Struct.new(:success?, :user, :errors, keyword_init: true)

    def self.call(params)
      new(params).call
    end

    def initialize(params)
      @email    = params[:email]&.downcase&.strip
      @phone    = params[:phone]&.strip
      @password = params[:password]
    end

    def call
      user = User.new(email: @email, phone: @phone, password: @password)

      unless user.valid?
        return Result.new(success?: false, errors: user.errors.full_messages)
      end

      ActiveRecord::Base.transaction do
        user.save!
        otp = user.generate_otp!
        OtpDeliveryJob.perform_later(user_id: user.id, otp: otp, channel: :sms)
      end

      Result.new(success?: true, user: user)
    rescue ActiveRecord::RecordInvalid => e
      Result.new(success?: false, errors: [e.message])
    end
  end
end
