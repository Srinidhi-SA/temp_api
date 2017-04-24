from django.db import models
from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

from api.views.option import default_settings_in_option, set_option

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, null=True)

    def reset_token(self):
        self.token = "p" + str(self.id) + "-" + str(uuid.uuid4())
        self.save()

    def logout(self):
        self.token = ""
        self.save()

    def rs(self):
        return {
            "id": self.user.id,
            "token": self.token,
            "username": self.user.username,
            "email": self.user.email,
            "full_name": self.user.get_full_name()
        }

class ProfileSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()

# CALLBACKS / HOOKS

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile_obj = Profile.objects.create(user=instance)

        # filling option table on login
        option_dict = default_settings_in_option()

        set_option(option_dict=option_dict,
                   userId=profile_obj.id)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()



