module Api
  module V1
    class PostsController < BaseController
      # GET /posts — Feed (respects visibility)
      def index
        posts = Post
          .visible_to(current_user)
          .includes(:user, :post_likes, media_files_attachments: :blob)
          .order(created_at: :desc)
          .then { |s| paginate(s) }

        render json: { posts: serialize_posts(posts) }
      end

      # GET /posts/:id — Single post
      def show
        post = Post.includes(:user, :post_likes, media_files_attachments: :blob).find(params[:id])
        return unless authorize_view!(post)

        render json: { post: serialize_post(post) }
      end

      # POST /posts — Create with multi-media (Instagram carousel)
      def create
        post = current_user.posts.build(
          caption:    params.dig(:post, :caption),
          visibility: params.dig(:post, :visibility) || "public",
          location:   params.dig(:post, :location)
        )

        # Support multiple media files (Instagram carousel)
        if params.dig(:post, :media_files).present?
          Array(params.dig(:post, :media_files)).each do |file|
            post.media_files.attach(file)
          end
        elsif params.dig(:post, :media).present?
          # Legacy single media upload
          post.media.attach(params.dig(:post, :media))
        end

        if post.save
          render json: { post: serialize_post(post) }, status: :created
        else
          render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /posts/:id
      def destroy
        post = current_user.posts.find(params[:id])
        post.destroy
        head :no_content
      end

      # POST /posts/:id/like
      def like
        post = Post.find(params[:id])
        return unless authorize_view!(post)

        liked = post.toggle_like!(current_user)
        render json: { liked: liked, likes_count: post.likes_count }
      end

      # GET /users/:user_id/posts — User's media gallery (Instagram profile grid)
      def gallery
        user = User.find(params[:user_id])
        posts = user.posts
                    .visible_to(current_user)
                    .includes(:post_likes, media_files_attachments: :blob)
                    .order(created_at: :desc)
                    .then { |s| paginate(s) }

        render json: { posts: serialize_posts(posts) }
      end

      private

      def authorize_view!(post)
        return true if post.visibility == "public"
        return true if post.user_id == current_user.id

        unless current_user.accepted_connections.exists?(
          ["requester_id = ? OR receiver_id = ?", post.user_id, post.user_id]
        )
          render json: { error: "You are not connected to this user" }, status: :forbidden
          return false
        end
        true
      end

      def serialize_post(post)
        PostSerializer.new(post, params: { current_user: current_user }).serializable_hash
      end

      def serialize_posts(posts)
        posts.map do |p|
          PostSerializer.new(p, params: { current_user: current_user })
                        .serializable_hash[:data][:attributes]
                        .merge(id: p.id)
        end
      end
    end
  end
end
