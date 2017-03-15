import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed

from django.contrib.auth.models import User
from api.lib import urlhelpers

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def login(request):
    email = request.POST['email']
    all = User.objects.filter(email=email)
    if all.count() == 0:
        raise AuthenticationFailed(detail="Sorry, there is no user that matches your email address")
    else:
        user = all.first()
        if not user.check_password(request.POST['password']):
            raise AuthenticationFailed(detail="Sorry, the credentials do not seem to match our records. Please try again")
        user.profile.reset_token()
        return Response({"token" : user.profile.token, "profile": user.profile.rs()})


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
