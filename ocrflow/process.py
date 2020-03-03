from ocrflow.handlers import update_reviewrequest_after_admin_approval, \
    update_leaverequest_after_superuser_approval

PROCESS = {
    'initial': {
        'form': None,
        'name': 'Admin Review',
        'on_completion': [update_reviewrequest_after_admin_approval],
        'group': 'Admin',
        'next_transition': 'superuser_approval'
        # if 'form' is not defined, then busineesflow
        # will use default ApprovalForm
    },
    'superuser_approval': {
        #'form': HrApprovalForm,
        'name': 'Superuser Review',
        'on_completion': [update_leaverequest_after_superuser_approval],
        'group': 'Superuser'
    }
}
