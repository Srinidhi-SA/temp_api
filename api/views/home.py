from django.shortcuts import render

def home(request):
    context = {"name": "Vivek"}
    return render(request, 'home.html', context)
