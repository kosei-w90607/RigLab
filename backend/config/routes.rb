Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: '/letter_opener' if Rails.env.development?

  namespace :api do
    namespace :v1 do
      root "tops#index"

      resources :users, only: %i[new create destroy]
      resources :password_resets, only: %i[new create edit update]

      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations',
        sessions: 'api/v1/auth/sessions',
        passwords: 'api/v1/auth/passwords'
      }

      get 'dashboard', to: 'dashboard#index'

      # Parts API
      resources :parts, only: %i[index show]

      # Presets API
      resources :presets, only: %i[index show]
    end
  end
end
