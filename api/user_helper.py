from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import request, response
import uuid

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save


class UserSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(required=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined", 'user_profile')


def jwt_response_payload_handler(token, user=None, request=None):

    # print user.date_joined - datetime.datetime.now(tz=)
    # if  (timezone.now() - user.date_joined).days > 30:
    #     return {
    #         'error': "Subscription expired."
    #     }
    return {
        'token': "JWT " + token,
        'user': UserSerializer(user, context={'request': request}).data
    }


class UserProfileSerializer(serializers.Serializer):

    class Meta:
        model = UserProfile
        field = ('photo', 'website', 'bio', 'phone', 'city', 'country', 'organization')

    def create(self, validated_data):  #
        userprofile_data = validated_data.pop('userprofile')
        user = User.objects.create(**validated_data)  # Create the user object instance before store in the DB
        user.set_password(validated_data['password'])  # Hash to the Password of the user instance
        user.save()  # Save the Hashed Password
        UserProfile.objects.create(user=user, **userprofile_data)
        return user  # Return user object

    def update(self, instance, validated_data):
        pass



class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='user')
    photo = models.FileField(
        verbose_name=("Profile Picture"),
        upload_to="profiles",
        format="Image",
        max_length=255,
        null=True,
        blank=True
    )
    website = models.URLField(default='', blank=True)
    bio = models.TextField(default='', blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    city = models.CharField(max_length=100, default='', blank=True)
    country = models.CharField(max_length=100, default='', blank=True)
    organization = models.CharField(max_length=100, default='', blank=True)

def create_profile(sender, **kwargs):
    user = kwargs["instance"]
    if kwargs["created"]:
        user_profile = UserProfile(user=user)
        user_profile.save()

post_save.connect(create_profile, sender=User)


from rest_framework import viewsets, generics
from rest_framework.response import Response

class UserProfileView(generics.CreateAPIView, generics.UpdateAPIView):

    def get_queryset(self):
        pass

    def get_serializer(self, *args, **kwargs):
        return UserProfile

    def create(self, request, *args, **kwargs):
        data = request.data
        serializers = self.get_serializer()
        ser = serializers(data = data)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)

        return Response({'message': 'Failed'})

    def update(self, request, *args, **kwargs):
        data = request.data
        user = request.user