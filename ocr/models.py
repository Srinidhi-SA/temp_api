"""
OCR MODELS
"""
import os
import uuid
import random
import string
from django.db import models
from django.template.defaultfilters import slugify
from django.core.exceptions import ValidationError
from api.models import User

# -------------------------------------------------------------------------------
# pylint: disable=too-many-ancestors
# pylint: disable=no-member
# pylint: disable=too-many-return-statements
# pylint: disable=too-many-locals
# pylint: disable=too-many-branches
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# pylint: disable=arguments-differ
# -------------------------------------------------------------------------------


def unique_dir():
    """Unique Directory"""
    return 'images/' + str(uuid.uuid1().hex)


def validate_file_extension(value):
    """ METHOD : To Validate file extension for OCRImage model FileField. """
    ext = os.path.splitext(value.name)[1]  # [0] returns path+filename
    valid_extensions = ['.jpg', '.png', '.jpeg', '.tif', '.pdf']
    if ext.lower() not in valid_extensions:
        raise ValidationError(u'Unsupported file extension.')


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
    slug = models.SlugField(null=False, blank=True, max_length=300)
    imagepath = models.CharField(max_length=2000, null=True)
    deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=True, db_index=True)

    def __str__(self):
        return " : ".join(["{}".format(x) for x in ["OCRImageSet", self.name, self.created_at, self.slug]])

    def generate_slug(self):
        """generate slug"""
        if not self.slug:
            self.slug = slugify(''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))
            self.name = "imgset-" + self.slug

    def save(self, *args, **kwargs):
        """Save OCRImage model"""
        self.generate_slug()
        super(OCRImageset, self).save(*args, **kwargs)

    def create(self):
        """Create OCRImageset model"""
        self.save()


class OCRImage(models.Model):
    """
    Model : OCRImage
    Viewset : OCRImageView
    Serializers : OCRImageSerializer, OCRImageListSerializer
    Router : ocrimage
    Description :
    """
    STATUS_CHOICES = [
        ('1', 'Ready to recognize.'),
        ('2', 'Ready to verify.'),
        ('3', 'Ready to export.'),
    ]
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    imagefile = models.FileField(null=True, upload_to='ocrData', validators=[validate_file_extension])
    imageset = models.ForeignKey(OCRImageset, null=False, db_index=True)
    datasource_type = models.CharField(max_length=300, null=True)
    datasource_details = models.CharField(max_length=3000, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=False, db_index=True)
    deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, choices=STATUS_CHOICES, default='Ready to recognize.')
    confidence = models.CharField(max_length=3, default="", null=True)
    comment = models.CharField(max_length=300, default="", null=True)

    def __str__(self):
        return " : ".join(["{}".format(x) for x in ["OCRImage", self.name, self.created_at, self.slug]])

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
