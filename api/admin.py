from django.contrib import admin

# Register your models here.

from api.models import Dataset, Insight, Job, Score, Trainer

admin.site.register(Dataset)
admin.site.register(Insight)
admin.site.register(Job)
admin.site.register(Score)
admin.site.register(Trainer)
