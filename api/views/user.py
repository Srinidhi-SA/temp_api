import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call
from django.utils import timezone
import datetime

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed

from django.contrib.auth.models import User
from api.lib import urlhelpers
from api.views.option import default_settings_in_option, set_option


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def login(request):
    email = request.POST['email']
    all = User.objects.filter(email=email)
    print "username:", request.POST['email']
    print "password:", request.POST['password']
    print "all--"
    if all.count() == 0:
        print "all-0"
        raise AuthenticationFailed(detail="Sorry, there is no user that matches your email address")
    else:
        print "all>0"
        user = all.first()
        if not user.check_password(request.POST['password']) :
            raise AuthenticationFailed(detail="Sorry, the credentials do not seem to match our records. Please try again")
        if not restrict_days(user):
            raise AuthenticationFailed(
                detail="Sorry, Your usage limit is reached. Please renew")
        user.profile.reset_token()

        return Response({"token": user.profile.token,
                         "profile": user.profile.rs(),
                         "userId": user.profile.id,
                         "username": user.username
                         })


@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def profile(request):

    user = urlhelpers.get_current_user(request)
    return Response({"profile": user.profile.rs()})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def logout(request):
    user = urlhelpers.get_current_user(request)
    user.profile.logout()
    return Response({"message": "User has been successufully logged out"})


def restrict_days(user):
    current_date = timezone.now()
    user_joining_date = user.date_joined
    time_difference = current_date - user_joining_date
    print time_difference.days

    days = time_difference.days
    if days > 30:
        return False
    return True

