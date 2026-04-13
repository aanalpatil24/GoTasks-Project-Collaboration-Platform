from django.apps import AppConfig

# Configures the core settings and initialization for the 'tasks' app
class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tasks'
    def ready(self):
        import apps.tasks.signals