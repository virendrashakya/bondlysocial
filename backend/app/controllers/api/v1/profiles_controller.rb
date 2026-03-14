module Api
  module V1
    class ProfilesController < BaseController
      before_action :set_profile, only: [:show]

      # GET /profiles/suggestions
      def suggestions
        profiles = UserMatcherService.call(current_user)
        render json: { profiles: ProfileSerializer.new(profiles, params: { current_user: current_user }).serializable_hash }
      end

      # GET /profiles/nearby?city=Mumbai&radius=25
      def nearby
        city   = params[:city].to_s.strip
        return render json: { profiles: { data: [] } } if city.blank?

        excluded_ids = current_user.blocked_user_ids + [@user&.id].compact + [current_user.id]

        profiles = Profile
          .joins(:user)
          .where(users: { status: "active", phone_verified: true })
          .where(hidden: false)
          .where.not(user_id: excluded_ids)
          .where("LOWER(city) LIKE ?", "%#{city.downcase}%")
          .limit(30)

        render json: { profiles: ProfileSerializer.new(profiles, params: { current_user: current_user }).serializable_hash }
      end

      # GET /profiles/search?q=&intent=&city=&interests[]=
      def search
        excluded_ids = current_user.blocked_user_ids + [current_user.id]

        profiles = Profile
          .joins(:user)
          .where(users: { status: "active", phone_verified: true })
          .where(hidden: false)
          .where.not(user_id: excluded_ids)

        if params[:q].present?
          term = "%#{params[:q].downcase}%"
          profiles = profiles.where("LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(occupation) LIKE ?", term, term, term)
        end

        profiles = profiles.where(intent: params[:intent]) if params[:intent].present?
        profiles = profiles.where("LOWER(city) LIKE ?", "%#{params[:city].downcase}%") if params[:city].present?

        if params[:interests].present?
          # Match profiles that have ANY of the requested interests
          profiles = profiles.where("interests ?| array[:interests]", interests: Array(params[:interests]))
        end

        profiles = profiles.limit(30)

        render json: { profiles: ProfileSerializer.new(profiles, params: { current_user: current_user }).serializable_hash }
      end

      # GET /profiles/:id
      def show
        render json: { profile: ProfileSerializer.new(@profile, params: { current_user: current_user }).serializable_hash }
      end

      # POST /profiles  (create own profile, called after OTP verification)
      def create
        profile = current_user.build_profile(profile_params)

        if profile.save
          render json: { profile: ProfileSerializer.new(profile).serializable_hash }, status: :created
        else
          render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /profiles/me
      def update
        profile = current_user.profile || current_user.build_profile
        profile.assign_attributes(profile_params)

        if profile.save
          render json: { profile: ProfileSerializer.new(profile).serializable_hash }
        else
          render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /profiles/me/avatar
      def upload_avatar
        current_user.profile.avatar.attach(params[:avatar])
        render json: { avatar_url: current_user.profile.avatar_url }
      end

      # POST /profiles/me/selfie
      def upload_selfie
        current_user.profile.selfie.attach(params[:selfie])
        render json: { message: "Selfie submitted for review" }
      end

      private

      def set_profile
        @profile = Profile.joins(:user)
                          .where(users: { status: "active" })
                          .where(hidden: false)
                          .find_by!(user_id: params[:id])
      end

      def profile_params
        params.require(:profile).permit(
          :name, :age, :gender, :city, :occupation, :bio, :intent, :hidden,
          :cultural_background, :cultural_background_custom,
          :religion, :religion_visibility,
          :height_cm, :body_type,
          :drinking, :smoking, :workout_frequency, :relationship_status,
          :show_height, :show_body_type, :show_online_status,
          interests: [], languages_spoken: [], appearance_tags: []
        )
      end
    end
  end
end
