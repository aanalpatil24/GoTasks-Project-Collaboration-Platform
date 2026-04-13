from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

# Triggers automatically after a user record is saved to the PostgreSQL database
@receiver(post_save, sender=User)
def handle_new_user_registration(sender, instance, created, **kwargs):
    if created:
        pass