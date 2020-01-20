import uuid
import random
import string
from django.db import models
from api.models import User
from django.template.defaultfilters import slugify


def unique_dir():
    return 'images/' + str(uuid.uuid1().hex)


class OCRImage(models.Model):
    # name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    file = models.ImageField(null=True, upload_to=unique_dir())
    datasource_type = models.CharField(max_length=300, null=True)
    datasource_details = models.CharField(max_length=3000, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=False, db_index=True)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify("img-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(OCRImage, self).save(*args, **kwargs)

    def create(self):
        if self.datasource_type in ['file', 'fileUpload']:
            self.save()


class OCRImageset(models.Model):
    name = models.CharField(max_length=300, null=True)
    imageset = models.ForeignKey(OCRImage, null=False, db_index=True)
    imagepath = models.CharField(max_length=300, null=True)
    deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")
