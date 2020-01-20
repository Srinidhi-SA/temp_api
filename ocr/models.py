from django.db import models
'''from api.models import User


class OCRImageset(models.Model):
    name = models.CharField(max_length=300, null=True)


class OCRImages(models.Model):
    slug = models.SlugField(null=False, blank=True, max_length=300)
    file = models.ImageField(null=True, upload_to='images')
    imageset = models.ForeignKey(OCRImageset, null=False, db_index=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=False, db_index=True)
'''