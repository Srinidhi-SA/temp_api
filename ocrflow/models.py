from django.db import models

# Create your models here.
import random
import string
import datetime
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
    reviewed_on = models.DateTimeField(
        null=True,
        blank=True,
        auto_now_add=True
    )
    comments = models.TextField(blank=True, null=True)
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
        self.comments = comments
        self.reviewed_on = datetime.datetime.now()
        self.is_closed = True
        reviewObj = ReviewRequest.objects.get(id=self.object_id)
        reviewObj.modified_by = self.assigned_user
        reviewObj.save()
        self.save()

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


class SimpleFlow(models.Model):
    tasks = GenericRelation(Task, related_name='tasks')

    class Meta:
        abstract = True

    @property
    def assigned_user(self):
        state = self.PROCESS['initial']
        Reviewers_queryset = User.objects.filter(
            groups__name=state['group'],
            is_active=True,
            ocruserprofile__is_active=True)

        for reviewer in Reviewers_queryset:
            isLimitReached = self.check_task_limit(state, reviewer)
            if isLimitReached:
                pass
            elif not isLimitReached:
                return reviewer
            else:
                return None

    def check_task_limit(self, state, user):
        totalPendingTasks = len(Task.objects.filter(
            assigned_user=user,
            is_closed=False))
        if totalPendingTasks >= state['rules']['auto']['max_docs_per_reviewer']:
            return True
        else:
            return False

    def start_simpleflow(self, initial_state=None):
        initial = initial_state or 'initial'
        state = self.PROCESS[initial]
        group = Group.objects.get(name=state['group'])
        content_type = ContentType.objects.get_for_model(self)

        if state['rules']['auto']['active']:
            reviewer = self.assigned_user
            if reviewer is None:
                print("No Reviewers available. Moving to backlog")
                pass
            else:
                Task.objects.create(
                    name=state['name'],
                    slug=initial,
                    assigned_group=group,
                    assigned_user=reviewer,
                    content_type=content_type,
                    object_id=self.id
                )
                self.status='submitted_for_review'
                self.save()

class ReviewRequest(SimpleFlow):
    # assign your process here
    PROCESS = process.AUTO_ASSIGNMENT
    slug = models.SlugField(null=False, blank=True, max_length=100)
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
    modified_at = models.DateTimeField(auto_now_add=True, null=True)
    modified_by = models.ForeignKey(
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
            ('reviewerL2_reviewed', 'ReviewerL2 Reviewed'),
            ('reviewerL2_rejected', 'ReviewerL2 Rejected'),
            ('reviewerL1_reviewed', 'ReviewerL1 Reviewed'),
            ('reviewerL1_rejected', 'ReviewerL1 Rejected'),
        ]
    )
    def save(self, *args, **kwargs):
        """Save OCRUserProfile model"""
        self.generate_slug()
        super(ReviewRequest, self).save(*args, **kwargs)

    def generate_slug(self):
        """generate slug"""
        if not self.slug:
            self.slug = slugify("ITEREQ" + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

def submit_for_approval(sender, instance, created, **kwargs):
    if created:
        print("Starting simpleflow for review ...")
        instance.status = "created"
        instance.save()
        instance.start_simpleflow()

post_save.connect(submit_for_approval, sender=ReviewRequest)
