
FROM python:3.11-slim

# Creates a restricted, non-root user to run the application safely
RUN adduser --disabled-password --no-create-home django_user

WORKDIR /app

# Added libpq-dev so the production PostgreSQL driver (psycopg2) compiles correctly
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-compiles static files into the staticfiles/ folder for production delivery
RUN DJANGO_SECRET_KEY=dummy DEBUG=True python manage.py collectstatic --noinput

# Transfers ownership of the app directory to the restricted user, then switches to it
RUN chown -R django_user:django_user /app
USER django_user

EXPOSE 8000

# Boots the ASGI server to handle both standard REST API traffic and real-time WebSocket connections
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
