from django.db import models

# Create your models here.
import random
import string
from django.template.defaultfilters import slugify
from django.db.models.signals import post_save
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import(
    GenericForeignKey,
    GenericRelation
)

from ocr.models import OCRImage
from ocrflow.forms import ApprovalForm
from ocrflow import process



class Task(models.Model):
    name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100)
    assigned_group = models.ForeignKey(Group, related_name='tasks')
    assigned_user = models.ForeignKey(User,blank=True, null=True)
    is_closed = models.BooleanField(default=False)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return " : ".join(["{}".format(x) for x in ["Task", self.name, self.slug]])

    def code(self):
        """Unique identifier of task"""
        return "{}-{}".format(self.slug, self.id)

    # def save(self, *args, **kwargs):
    #     """Save Task model"""
    #     self.generate_slug()
    #     super(Task, self).save(*args, **kwargs)

    # def generate_slug(self):
    #     """generate slug"""
    #     if not self.slug:
    #         self.slug = slugify(str(self.name) + '-' + ''.join(
    #             random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    @property
    def process_config(self):
        return self.content_object.PROCESS

    @property
    def state(self):
        return self.process_config[self.slug]

    @property
    def get_approval_form(self):
        return self.state.get('form', None) or ApprovalForm

    @property
    def next_transition(self):
        return self.state.get('next_transition', None)

    def submit(self, form, user):
        status = form.cleaned_data['status']
        comments = form.cleaned_data['remarks']
        #status = "approved"
        #comments = "ReviewerL2 Approved"
        self.is_closed = True
        self.save()

        Approval.objects.create(
            task=self,
            approval_by=self.assigned_user,
            status=status,
            comments=comments
        )

        # execute content object task action
        self.execute_task_actions(form)

        if self.next_transition:
            new_state = self.process_config[self.next_transition]
            new_user = self.assign_newuser(new_state)
            self.create_new_task(new_state)

    def assign_newuser(self, state):
        return User.objects.filter(
            groups__name=state['group'],
            is_active=True).order_by('?').first()

    def create_new_task(self, state):
        print(self.content_object)
        group = Group.objects.get(name=state['group'])
        newuser = self.assign_newuser(state)
        Task.objects.create(
            name=state['name'],
            slug=self.next_transition,
            assigned_group=group,
            assigned_user=newuser,
            content_type=self.content_type,
            object_id=self.content_object.id
        )

    def execute_task_actions(self, form):
        task_actions = self.state['on_completion']
        for action in task_actions:
            action(form, self.content_object)




class Approval(models.Model):
    task = models.OneToOneField(Task, related_name='approval')
    approval_by = models.ForeignKey(
        User, blank=True, null=True, related_name='+')
    approval_on = models.DateTimeField(
        null=True,
        blank=True,
        auto_now_add=True
    )
    comments = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=100, choices=[
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ])


class SimpleFlow(models.Model):
    tasks = GenericRelation(Task)

    class Meta:
        abstract = True

    @property
    def assigned_user(self):
        state = self.PROCESS['initial']
        return User.objects.filter(
            groups__name=state['group'],
            is_active=True).order_by('?').first()

    def start_simpleflow(self, initial_state=None):
        initial = initial_state or 'initial'
        state = self.PROCESS[initial]
        group = Group.objects.get(name=state['group'])
        content_type = ContentType.objects.get_for_model(self)

        obj = Task.objects.create(
            name=state['name'],
            slug=initial,
            assigned_group=group,
            assigned_user=self.assigned_user,
            content_type=content_type,
            object_id=self.id
        )
        #obj.submit(state['form'],user=None)

class ReviewRequest(SimpleFlow):
    # assign your process here
    PROCESS = process.AUTO_ASSIGNMENT

    ocr_image = models.ForeignKey(
        OCRImage,
        blank=True,
        null=True,
        related_name='review_requests'
    )

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.ForeignKey(
        User,
        blank=True,
        null=True,
        related_name='+'
    )
    status = models.CharField(
        max_length=40,
        blank=True,
        null=True,
        choices=[
            ('created', 'Created'),
            ('submitted_for_review', 'Submitted for review'),
            ('reviewerL2_approved', 'ReviewerL2 Approved'),
            ('reviewerL2_rejected', 'ReviewerL2 Rejected'),
            ('reviewerL1_approved', 'ReviewerL1 Approved'),
            ('reviewerL1_rejected', 'ReviewerL1 Rejected'),
            ('superuser_approved', 'Superuser Approved'),
            ('superuser_rejected', 'Superuser Rejected'),
            ('admin_approved', 'Admin Approved'),
            ('admin_rejected', 'Admin Rejected')
        ]
    )

    def slug(self):
        return "ITEREQ-{}".format(self.id)

def submit_for_approval(sender, instance, created, **kwargs):
    if created:
        print("Starting simpleflow for review ...")
        instance.status = "submitted_for_review"
        instance.save()
        instance.start_simpleflow()

post_save.connect(submit_for_approval, sender=ReviewRequest)
