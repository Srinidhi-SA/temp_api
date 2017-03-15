import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed

from django.contrib.auth.models import User

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
        return Response({"token" : user.profile.token})
