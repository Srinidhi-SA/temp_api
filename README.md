# API 

  - config/settings
```python
    ROOT_URLCONF = 'config.urls'
```

  - manage.py
```python
if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
```

  - creating new app inside api
```bash
python manage.py startapp <app_name>
```

```bash
#> ls
api---
  app_name---
    |----- __init__.py
    |----- views.py
    |----- models.py
    etc.
```
```python
# Make changes in models, serializers, views, test

# use makemigrations and migrate to create models DB

# use api/usrls.py to register routers

```
