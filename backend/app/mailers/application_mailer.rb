class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('MAILER_FROM', 'noreply@riglab.example.com')
  layout 'mailer'
end
