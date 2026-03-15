FROM ruby:3.3.4-slim

RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3

COPY . .

# Precompile nothing (API only), but warm the bootsnap cache
RUN bundle exec bootsnap precompile app/ lib/ 2>/dev/null || true

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]
