from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def showme(request):
    return HttpResponse("Alright, this is a test");
