"""
OCR MODELS
"""

import random
import string
import datetime
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models.signals import post_save
from django.template.defaultfilters import slugify

from ocr import validators
from ocr.tasks import send_welcome_email


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

class OCRUserProfile(models.Model):
    OCR_USER_TYPE_CHOICES = [
        ('1', 'Default'),
        ('2', 'Reviewer'),
    ]
    ocr_user = models.OneToOneField(User, null=True, db_index=True, on_delete=models.CASCADE)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    is_active = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True, default='', validators=[validators.validate_phone_number])
    user_type = models.CharField(max_length=20, null=True, choices=OCR_USER_TYPE_CHOICES, default='Default')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

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

    def json_serialized(self):
        ocr_user_profile = {
            "slug": self.slug,
            "active": self.is_active,
            "phone": self.phone,
            "user_type": self.user_type,
            "role": self.ocr_user.groups.values_list('name', flat=True)
        }
        return ocr_user_profile

    def reviewer_data(self):
        from ocrflow.models import Task
        total_assignments = Task.objects.filter(assigned_user=self.ocr_user).count()
        total_reviewed = Task.objects.filter(
            assigned_user=self.ocr_user,
            is_closed=True).count()
        data = {
            'assignments': total_assignments,
            'avgTimeperWord': None,
            'accuracyModel': self.get_avg_accuracyModel(),
            'completionPercentage': self.get_review_completion(
                total_reviewed,
                total_assignments)
        }
        return data

    def get_review_completion(self, total_reviewed, total_assignments):
        if total_assignments == 0:
            return 0
        else:
            percentage = (total_reviewed / total_assignments) * 100
            return round(percentage, 2)

    def get_avg_accuracyModel(self):
        imageQueryset = OCRImage.objects.filter(
            review_requests__tasks__assigned_user=self.ocr_user
        )
        TotalCount = 0
        TotalConfidence = 0
        for image in imageQueryset:
            accuracyModel = image.get_accuracyModel()
            if not accuracyModel == None:
                TotalCount += 1
                TotalConfidence += float(accuracyModel)
            else:
                print("confidence missing.")

        if TotalCount == 0:
            return 0
        else:
            AvgPercentage = (TotalConfidence / TotalCount)
            return round(AvgPercentage, 2)

    def get_slug(self):
        return self.slug


def send_email(sender, instance, created, **kwargs):
    if created:
        print("Sending welcome mail ...")
        send_welcome_email.delay(username=instance.ocr_user.username)

post_save.connect(send_email, sender=OCRUserProfile)


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
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return " : ".join(["{}".format(x) for x in ["Project", self.name, self.created_at, self.slug]])

    def generate_slug(self):
        """generate slug"""
        if not self.slug:
            self.slug = slugify(str(self.name) + '-' + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        """Save Project model"""
        self.generate_slug()
        super(Project, self).save(*args, **kwargs)

    def create(self):
        """Create Project model"""
        self.save()

    def get_project_overview(self):
        totalTasks, closedTasks = self.get_workflow_data()
        overview = {
            "workflows": totalTasks,
            "completion": self.get_completion_percentage(totalTasks, closedTasks)
        }
        return overview

    def get_workflow_data(self):
        from ocrflow.models import Task, ReviewRequest
        totalTasks = 0
        closedTasks = 0
        reviewObjQueryset = ReviewRequest.objects.filter(
            ocr_image__project=self.id
        )
        for reviewObj in reviewObjQueryset:
            TaskQueryset = Task.objects.filter(object_id=reviewObj.id)
            for task in TaskQueryset:
                totalTasks += 1
                if task.is_closed:
                    closedTasks += 1

        return totalTasks, closedTasks

    def get_completion_percentage(self, totalTasks, closedTasks):
        if totalTasks == 0:
            return 0
        else:
            percentage = (closedTasks / totalTasks) * 100
            return round(percentage, 2)


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
    project = models.ForeignKey(Project, null=False, db_index=True)

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
        ("ready_to_recognize", "Ready to recognize"),
        ("ready_to_verify", "Ready to verify"),
        ("ready_to_export", "Ready to export")
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
    status = models.CharField(max_length=100, null=True, choices=STATUS_CHOICES, default='ready_to_recognize')
    confidence = models.CharField(max_length=30, default="", null=True)
    comment = models.CharField(max_length=300, default="", null=True)
    generated_image = models.FileField(null=True, upload_to='ocrData')
    comparision_data = models.TextField(max_length=300000, default="{}", null=True)
    converted_Coordinates = models.TextField(max_length=300000, default="{}", null=True)
    conf_google_response = models.TextField(max_length=3000000, default="{}", null=True)
    analysis_list = models.TextField(max_length=300000, default="{}", null=True)
    analysis = models.TextField(max_length=300000, default="{}", null=True)
    flag = models.CharField(max_length=300, default="", null=True)
    final_result = models.TextField(max_length=300000, default="{}", null=True)
    is_recognized = models.BooleanField(default=False)
    mask = models.FileField(null=True, upload_to='ocrData')
    is_L1assigned = models.BooleanField(default=False)
    is_L2assigned = models.BooleanField(default=False)
    assignee = models.ForeignKey(User, null=True, blank=True, db_index=True, related_name='assignee')
    modified_at = models.DateTimeField(auto_now_add=True, null=True)
    fields = models.IntegerField(null=True)
    modified_by = models.ForeignKey(User, null=True, db_index=True, related_name='modified_by')
    review_start = models.DateTimeField(auto_now_add=False, null=True)
    review_end = models.DateTimeField(auto_now_add=False, null=True)

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
        self.project_last_update()
        super(OCRImage, self).save(*args, **kwargs)

    def create(self):
        """Create OCRImage model"""
        if self.datasource_type in ['fileUpload']:
            self.save()

    def update_status(self, status):
        self.status = status
        self.save()

    def get_assignee(self):
        """Return OCRImage Reviewer"""
        try:
            return self.assignee.username
        except:
            return None

    def get_accuracyModel(self):
        """Return image confidence percentage"""
        return self.confidence

    def project_last_update(self):
        projectObj = Project.objects.get(id=self.project.id)
        projectObj.updated_at = datetime.datetime.now()
        projectObj.save()
