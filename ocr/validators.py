"""
OCR validations
"""
from django.core.exceptions import ValidationError

VALID_EXTENSIONS = ['jpg', 'png', 'jpeg', 'tif', 'pdf']
VALIDATION_ERROR_MESSAGE = 'Unsupported file extension.'


def max_file_size(value):
    """ METHOD : To Validate max file size for OCRImage model FileField. """
    limit = 50 * 1024 * 1024
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 50 MB.')
