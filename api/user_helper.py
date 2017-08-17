from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined")


def jwt_response_payload_handler(token, user=None, request=None):
    return {
        'token': "JWT " + token,
        'user': UserSerializer(user, context={'request': request}).data
    }