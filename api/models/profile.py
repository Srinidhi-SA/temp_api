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


from rest_framework.exceptions import AuthenticationFailed
# A Decorator which takes a function
def provide_token_or_email_and_password(view_function):
    from django.utils.functional import wraps
    @wraps(view_function)
    def _wrapped_view(request, *args, **kwargs):
        token = request.META.get('HTTP_TOKEN') or request.META.get('HTTP_X_TOKEN')
        if not token:
            email = request.META['HTTP_EMAIL']
            all = User.objects.filter(email=email)
            if all.count() == 0:
                print "all-0"
                raise AuthenticationFailed(detail="Sorry, there is no user that matches your email address")
            else:
                print "all>0"
                user = all.first()
                from api.helper import DateHelp
                print request.META['HTTP_PASSWORD']
                if not user.check_password(request.META['HTTP_PASSWORD']):
                    raise AuthenticationFailed(
                        detail="Sorry, the credentials do not seem to match our records. Please try again")
                if not DateHelp.restrict_days(user.date_joined):
                    raise AuthenticationFailed(
                        detail="Sorry, Your usage limit is reached. Please renew")
                return view_function(request, *args, **kwargs)
        else:
            try:
                profile = Profile.objects.get(token=token)
                return view_function(request, *args, **kwargs)
            except Profile.DoesNotExist as e:
                raise AuthenticationFailed(detail="Invalid user token provided. Please provide a active user token.")
    return _wrapped_view