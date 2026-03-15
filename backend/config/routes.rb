Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do

      # Public app config (no auth required)
      get "app_config", to: "app_configs#index"

      # Auth (public)
      scope :auth do
        post "signup",      to: "auth#signup"
        post "login",       to: "auth#login"
        post "verify_otp",  to: "auth#verify_otp"
        post "refresh",     to: "auth#refresh"
        delete "logout",    to: "auth#logout"
      end

      # Profile discovery
      get  "profiles/suggestions", to: "profiles#suggestions"
      get  "profiles/nearby",      to: "profiles#nearby"
      get  "profiles/search",      to: "profiles#search"
      get  "profiles/:id",         to: "profiles#show"
      post "profiles",             to: "profiles#create"
      patch "profiles/me",         to: "profiles#update"
      post "profiles/me/avatar",   to: "profiles#upload_avatar"
      post "profiles/me/selfie",   to: "profiles#upload_selfie"

      # User preferences (privacy + notifications)
      get   "preferences",         to: "preferences#show"
      patch "preferences",         to: "preferences#update"

      # Posts (photo / video feed — Instagram-style)
      resources :posts, only: [:index, :show, :create, :destroy] do
        member { post :like }
      end
      # User media gallery (Instagram profile grid)
      get "users/:user_id/posts", to: "posts#gallery", as: :user_gallery

      # Connections
      resources :connections, only: [:index, :create] do
        collection { get :requests }
        member do
          post :accept
          post :reject
        end
      end

      # Messages (scoped to connection)
      get  "messages/:connection_id",           to: "messages#index"
      post "messages",                          to: "messages#create"
      post "messages/:id/react",                to: "messages#react"
      post "messages/:id/pin",                  to: "messages#pin"
      get  "messages/:connection_id/pinned",    to: "messages#pinned"
      post "messages/:connection_id/typing",    to: "messages#typing"
      post "messages/:connection_id/mark_read", to: "messages#mark_read"

      # Groups
      resources :groups, only: [:index, :show, :create] do
        member do
          post   :join
          delete :leave
          get    :messages
          post   :messages, action: :send_message
        end
      end

      # Safety
      post   "reports",      to: "safety#report"
      post   "blocks",       to: "safety#block"
      delete "blocks/:id",   to: "safety#unblock"
      get    "blocks",       to: "safety#index"

      # Notifications
      resources :notifications, only: [:index] do
        member  { patch :mark_read }
        collection { patch :read_all, to: "notifications#mark_all_read" }
      end

    end
  end
end
