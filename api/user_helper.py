from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import request, response

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined")


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