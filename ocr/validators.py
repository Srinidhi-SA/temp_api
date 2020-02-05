"""
OCR Validations
"""

#-------------------------------------------------------------------------------
"""
Validate Hostname/IP Address
"""
def validate_host(host):
    # Remove leading zeroes in hostname (if provided)
    new_ip = ".".join([str(int(i)) for i in ip.split(".")])
    import socket
    try:
        socket.inet_aton(new_ip)
        return True
    except socket.error:
        return False
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
"""
Validate SSH Port for SFTP
"""
def validate_port(port):
    try:
        if port == 22:
            return True
        elif port in range (1024, 65535):
            return True
    except Exception as err:
        print(err)          

#-------------------------------------------------------------------------------
#-------------------------------------------------------------------------------

"""
Validation for OCR Image file extension, max_file_size and no of attachments
"""
from django.core.exceptions import ValidationError

VALID_EXTENSIONS = ['jpg', 'png', 'jpeg', 'tif', 'pdf']
VALIDATION_ERROR_MESSAGE = 'Unsupported file extension.'


def max_file_size(value):
    """ METHOD : To Validate max file size for OCRImage model FileField. """
    limit = 50 * 1024 * 1024
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 50 MB.')

#---------------------------------------------------------------------------------
