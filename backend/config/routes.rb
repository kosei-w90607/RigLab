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
        delete 'sign_out', to: 'sessions#destroy'
      end

      get 'dashboard', to: 'dashboard#index'

      # Parts API
      resources :parts, only: %i[index show] do
        collection do
          get :recommendations
        end
      end

      # Presets API
      resources :presets, only: %i[index show]

      # Builds API (カスタム構成)
      resources :builds, only: %i[index show create update destroy]
      get 'builds/shared/:share_token', to: 'builds#shared', as: :shared_build

      # Share Tokens API (未保存構成の共有)
      resources :share_tokens, only: %i[create], param: :token
      get 'share_tokens/:token', to: 'share_tokens#show', as: :share_token

      # Price Histories API
      get 'parts/:part_type/:part_id/price_histories', to: 'price_histories#show'

      # Buy Advice API
      get 'parts/:part_type/:part_id/buy_advice', to: 'buy_advice#show'
      get 'buy_advice/summary', to: 'buy_advice#summary'

      # Rankings API
      resources :rankings, only: [:index]

      # Price Trends API
      get 'price_trends/categories', to: 'price_trends#categories'
      get 'price_trends/categories/:category', to: 'price_trends#category_detail'

      # Admin API
      namespace :admin do
        resources :parts, only: %i[create update destroy] do
          member do
            post :link_rakuten
          end
        end
        resources :presets, only: %i[show create update destroy]
        resources :users, only: %i[index update]
        get 'rakuten_search', to: 'rakuten_search#index'
        post 'price_fetch', to: 'price_fetch#create'
      end
    end
  end
end
