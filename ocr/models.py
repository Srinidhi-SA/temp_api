"""
OCR MODELS
"""

import random
import string
from django.db import models
from django.template.defaultfilters import slugify
from django.core.validators import FileExtensionValidator
from api.models import User
from ocr import validators
from django.conf import settings


# -------------------------------------------------------------------------------
# pylint: disable=too-many-ancestors
# pylint: disable=no-member
# pylint: disable=too-many-return-statements
# pylint: disable=too-many-locals
# pylint: disable=too-many-branches
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# pylint: disable=arguments-differ
# pylint: disable=too-few-public-methods
# -------------------------------------------------------------------------------

class Project(models.Model):
    """
    Model :
    Viewset :
    Serializers :
    Router :
    Description :
    """
    name = models.CharField(max_length=100, null=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=True, db_index=True)

    def __str__(self):
        return " : ".join(["{}".format(x) for x in ["Project", self.name, self.created_at, self.slug]])

    def generate_slug(self):
        """generate slug"""
        if not self.slug:
            self.slug = slugify(str(self.name) + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))
            self.name = "ocrproject-" + self.slug

    def save(self, *args, **kwargs):
        """Save Project model"""
        self.generate_slug()
        super(Project, self).save(*args, **kwargs)

    def create(self):
        """Create Project model"""
        self.save()


class OCRUserProfile(models.Model):
    OCR_USER_TYPE_CHOICES = [
        ('1', 'Default'),
        ('2', 'Reviewer'),
    ]
    OCR_REVIEWER_ROLE = [
        ('0', 'NA'),
        ('1', 'Admin'),
        ('2', 'Reviewer L1'),
        ('3', 'Reviewer L2'),
        ('4', 'Reviewer L3'),
    ]
    ocr_user = models.OneToOneField(User, null=True, db_index=True, on_delete=models.CASCADE)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    is_active = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True, default='', validators=[validators.validate_phone_number])
    user_type = models.CharField(max_length=20, null=True, choices=OCR_USER_TYPE_CHOICES, default='Default')
    reviewer_type = models.CharField(max_length=20, null=True, choices=OCR_REVIEWER_ROLE, default='NA')

    # def __str__(self):
    #     return " : ".join(["{}".format(x) for x in ["OCRUserProfile", self.ocr_user, self.user_type]])
    def generate_slug(self):
        """generate slug"""

        if not self.slug:
            self.slug = slugify(str(self.ocr_user.username) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        """Save OCRUserProfile model"""
        self.generate_slug()
        super(OCRUserProfile, self).save(*args, **kwargs)

from django.db.models.signals import post_save

def send_welcome_email(sender, instance, created, **kwargs):
    #user = kwargs["instance"]
    #if kwargs["created"]:
    print("Sending mail")
    # your code goes here...

post_save.connect(send_welcome_email, sender=OCRUserProfile)


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
        """Save OCRImageset model"""
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
        ("1", "Ready to recognize."),
        ("2", "Ready to verify."),
        ("3", "Ready to export.")
    ]
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    imagefile = models.FileField(null=True, upload_to='ocrData', validators=[
        FileExtensionValidator(allowed_extensions=validators.VALID_EXTENSIONS,
                               message=validators.VALIDATION_ERROR_MESSAGE)])
    imageset = models.ForeignKey(OCRImageset, null=False, db_index=True)
    project = models.ForeignKey(Project, null=False, db_index=True)
    datasource_type = models.CharField(max_length=300, null=True)
    datasource_details = models.CharField(max_length=3000, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(User, null=False, db_index=True)
    deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, choices=STATUS_CHOICES, default='Ready to recognize.')
    confidence = models.CharField(max_length=30, default="", null=True)
    comment = models.CharField(max_length=300, default="", null=True)
    generated_image = models.FileField(null=True, upload_to='ocrData')
    comparision_data = models.TextField(max_length=300000, default="", null=True)
    converted_Coordinates = models.TextField(max_length=300000, default="", null=True)
    analysis_list = models.TextField(max_length=300000, default="", null=True)
    analysis = models.TextField(max_length=300000, default="", null=True)
    flag = models.CharField(max_length=300, default="", null=True)
    final_result = models.TextField(max_length=300000, default="", null=True)
    is_recognized = models.BooleanField(default=False)

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
