"""
OCR MODELS
"""
import os
import uuid
import random
import string
from django.db import models
from api.models import User
from django.template.defaultfilters import slugify


def unique_dir():
    """Unique Directory"""
    return 'images/' + str(uuid.uuid1().hex)


def validate_file_extension(value):
    """ METHOD : To Validate file extension for OCRImage model FileField. """
    from django.core.exceptions import ValidationError
    ext = os.path.splitext(value.name)[1]  # [0] returns path+filename
    valid_extensions = ['.jpg', '.png', '.jpeg', '.tif', '.pdf']
    if ext.lower() not in valid_extensions:
        raise ValidationError(u'Unsupported file extension.')


class OCRImage(models.Model):
    """
    Model :
    Viewset :
    Serializers :
    Router :
    Description :
    """
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    file = models.FileField(null=True, upload_to=unique_dir(), validators=[validate_file_extension])
    datasource_type = models.CharField(max_length=300, null=True)
    datasource_details = models.CharField(max_length=3000, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=False, db_index=True)
    deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    def generate_slug(self):
        """generate slug"""
        if not self.slug:
            self.slug = slugify("img-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        """Save OCRImage model"""
        self.generate_slug()
        super(OCRImage, self).save(*args, **kwargs)

    def create(self):
        """Create OCRImage model"""
        if self.datasource_type in ['fileUpload']:
            self.save()


# pylint: disable=too-few-public-methods
class OCRImageset(models.Model):
    """
    Model :
    Viewset :
    Serializers :
    Router :
    Description :
    """
    name = models.CharField(max_length=300, null=True)
    imageset = models.ForeignKey(OCRImage, null=True, db_index=True)
    imagepath = models.CharField(max_length=300, null=True)
    deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")
