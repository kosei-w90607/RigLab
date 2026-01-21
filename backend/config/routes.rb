Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: '/letter_opener' if Rails.env.development?

  namespace :api do
    namespace :v1 do
      root "tops#index"

      resources :users, only: %i[new create destroy]
      resources :password_resets, only: %i[new create edit update]

      # 認証エンドポイント（NextAuth.js連携）
      namespace :auth do
        post 'login', to: 'sessions#create'
        post 'register', to: 'registrations#create'
        get 'me', to: 'sessions#me'
      end

      get 'dashboard', to: 'dashboard#index'

      # Parts API
      resources :parts, only: %i[index show]

      # Presets API
      resources :presets, only: %i[index show]

      # Builds API (カスタム構成)
      resources :builds, only: %i[index show create update destroy]
      get 'builds/shared/:share_token', to: 'builds#shared', as: :shared_build

      # Admin API
      namespace :admin do
        resources :parts, only: %i[create update destroy]
        resources :presets, only: %i[show create update destroy]
      end
    end
  end
end
