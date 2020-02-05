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
