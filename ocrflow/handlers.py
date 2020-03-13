import datetime
def update_reviewrequest_after_RL1_approval(form, reviewrequest):
    """This function will get trigger after admin approval.
    Use this function for appropriate state in PROCESS config(process.py).
    """
    status = form.cleaned_data['status']

    reviewrequest.status = "reviewerL1_{}".format(status)
    reviewrequest.modified_at = datetime.datetime.now()
    reviewrequest.ocr_image.status = 'Ready to verify.'
    reviewrequest.ocr_image.save()
    reviewrequest.save()

def update_reviewrequest_after_RL2_approval(form, reviewrequest):
    """This function will get trigger after superuser approval.
    Use this function for appropriate state in PROCESS config(process.py).
    """
    status = form.cleaned_data['status']

    reviewrequest.status = "reviewerL2_{}".format(status)
    reviewrequest.save()
