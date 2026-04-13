from django.apps import AppConfig

# Configures the core settings and initialization for the 'users' app
class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        import apps.users.signals