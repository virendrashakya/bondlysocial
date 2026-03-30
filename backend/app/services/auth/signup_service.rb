module Auth
  class SignupService
    Result = Struct.new(:success?, :user, :errors, keyword_init: true)

    def self.call(params)
      new(params).call
    end

    def initialize(params)
      @email    = params[:email]&.downcase&.strip
      @phone    = params[:phone]&.gsub(/[\s\-\(\)]/, "")&.strip
      @password = params[:password]
    end

    def call
      existing_user = User.find_by(email: @email) || User.find_by(phone: @phone)

      if existing_user
        return Result.new(success?: false, errors: ["Account already exists. Please log in."])
      end

      user = User.new(email: @email, phone: @phone, password: @password)

      unless user.valid?
        return Result.new(success?: false, errors: user.errors.full_messages)
      end

      otp = rand(100_000..999_999).to_s

      # Cache payload securely in Redis for 10 minutes
      payload = {
        email: @email,
        phone: @phone,
        password: @password,
        otp: otp
      }
      Rails.cache.write("signup_otp:#{@phone}", payload, expires_in: 10.minutes)

      # Dispatch SMS securely without database ID
      OtpDeliveryJob.perform_later(phone: @phone, otp: otp, channel: :sms)

      Result.new(success?: true, user: nil) # User is not created until step 2
    rescue StandardError => e
      Result.new(success?: false, errors: [e.message])
    end
  end
end
