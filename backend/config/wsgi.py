import os
from django.core.wsgi import get_wsgi_application

# Sets the environment variable to point to main settings file
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Standard entry point for synchronous web servers (like pure Gunicorn or uWSGI)
application = get_wsgi_application()