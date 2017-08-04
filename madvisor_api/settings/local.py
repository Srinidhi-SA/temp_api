from base import *
import datetime


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

PROJECT_APP = [
]

INSTALLED_APPS += PROJECT_APP


STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
print os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'api/static')
