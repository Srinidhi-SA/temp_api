"""
OCR AdminSite Settings
"""
from django.contrib import admin

# Register your models here.
from ocr.models import OCRImage, OCRImageset, OCRUserProfile

# -------------------------------------------------------------------------------
# pylint: disable=too-few-public-methods
# pylint: disable=no-member
# pylint: disable=too-many-return-statements
# pylint: disable=too-many-locals
# pylint: disable=too-many-branches
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# -------------------------------------------------------------------------------


class OCRImageAdmin(admin.ModelAdmin):
    """
    Model: OCRImage
    """
    icon = '<i class="material-icons">cloud_done</i>'
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "status", "created_by", "deleted"]
    list_filter = ["status", "deleted", "created_by"]
    readonly_fields = ["created_at", "deleted", "created_by", "slug", "imageset"]

    def get_queryset(self, request):
        queryset = super(OCRImageAdmin, self).get_queryset(request)
        queryset = queryset.order_by('-created_at')
        return queryset


class OCRImagesetAdmin(admin.ModelAdmin):
    """
    Model: OCRImageset
    """
    icon = '<i class="material-icons">cloud_done</i>'
    search_fields = ["name"]
    list_display = ["name", "status", "created_by"]
    list_filter = ["status", "created_by"]
    readonly_fields = ["slug", "imagepath", "created_by"]

    def get_queryset(self, request):
        queryset = super(OCRImagesetAdmin, self).get_queryset(request)
        queryset = queryset.order_by('-created_at')
        return queryset

class OCRUserProfileAdmin(admin.ModelAdmin):
    """
    Model: OCRUserProfile
    """
    icon = '<i class="material-icons">cloud_done</i>'
    search_fields = ["slug"]
    list_display = ["slug", "is_active"]
    list_filter = ["is_active"]
    readonly_fields = ["slug"]

    def get_queryset(self, request):
        queryset = super(OCRUserProfileAdmin, self).get_queryset(request)
        #queryset = queryset.order_by('-created_at')
        return queryset


admin.site.register(OCRImage, OCRImageAdmin)
admin.site.register(OCRImageset, OCRImagesetAdmin)
admin.site.register(OCRUserProfile, OCRUserProfileAdmin)
