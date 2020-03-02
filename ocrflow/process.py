PROCESS = {
    'initial': {
        'name': 'Admin Review',
        'on_completion': None, #[update_leaverequest_after_manager_approval],
        'group': 'Admin',
        'next_transition': 'hr_approver'
        # if 'form' is not defined, then busineesflow
        # will use default ApprovalForm
    },
    'hr_approver': {
        #'form': HrApprovalForm,
        'name': 'Superuser Review',
        'on_completion': None, #[update_leaverequest_after_hr_approval],
        'group': 'Superuser'
    }
}
