def update_reviewrequest_after_admin_approval(form, reviewrequest):
    """This function will get trigger after admin approval.
    Use this function for appropriate state in PROCESS config(process.py).
    """
    status = "Admin Approved"

    reviewrequest.status = "admin_{}".format(status)
    reviewrequest.save()

def update_leaverequest_after_superuser_approval(form, leaverequest):
    """This function will get trigger after superuser approval.
    Use this function for appropriate state in PROCESS config(process.py).
    """
    status = "Superuser Approved"

    reviewrequest.status = "superuser_{}".format(status)
    reviewrequest.save()
