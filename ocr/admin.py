"""
OCR AdminSite Settings
"""
from django.contrib import admin

# Register your models here.
from ocr.models import OCRImage, OCRImageset


# pylint: disable=too-few-public-methods
class OCRImageAdmin(admin.ModelAdmin):
    """
    Model: OCRImage
    """
    icon = '<i class="material-icons">cloud_done</i>'
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "status", "created_by", "deleted"]
    list_filter = ["status", "deleted", "created_by"]
    readonly_fields = ["created_at", "deleted", "created_by", "slug"]


# pylint: disable=too-few-public-methods
class OCRImagesetAdmin(admin.ModelAdmin):
    """
    Model: OCRImageset
    """
    icon = '<i class="material-icons">cloud_done</i>'
    search_fields = ["name"]
    list_display = ["name", "status", "created_by"]
    list_filter = ["status", "created_by"]
    readonly_fields = ["created_by"]


admin.site.register(OCRImage, OCRImageAdmin)
admin.site.register(OCRImageset, OCRImagesetAdmin)
