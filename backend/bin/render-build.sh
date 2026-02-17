#!/usr/bin/env bash
set -o errexit

gem install bundler
bundle install
bundle exec rails db:migrate
bundle exec rails db:seed
