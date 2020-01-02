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
  datasets---
    |----- __init__.py
    |----- views.py
    |----- serializer.py
    |----- urls.py
  C3Chart----
    |----- __init__.py
    |----- c3charts.py
    |----- config.py
  lib--------
    |----- fab
  model.py           # model
  utils.py           # serializers and other classes
  views.py           # views
  test.py
  helper.py          # some helper function
  exceptions.py      # creation and updation exceptions
  pagination.py      # how to paginate
  query_filtering.py # filter model
  redis_access.py
```
```python
# Make changes in models, serializers, views, test
 - first create model
 - serializer accordingly (also make list serializer)
 - add views for above model and use serializer
 - add router in urls.py
 - makemigrations and migrate
 - test
 - add and commit changes 

# use makemigrations and migrate to create models DB

# use api/urls.py to register routers

```
