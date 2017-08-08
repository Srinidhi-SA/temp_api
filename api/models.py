from django.db import models


class Job(models.Model):

    job_type = models.CharField(max_length=300, null=False)
    object_id = models.CharField(max_length=300, null=False)
    name = models.CharField(max_length=300, null=False, default="")
    slug = models.SlugField(null=True)
    config = models.TextField(default="{}")
    results = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    deleted = models.BooleanField(default=False)

    def generate_slug(self):
        if not self.slug:
           self.slug = slugify(str(self.name) + "-" + ''.join(
               random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        submit_job(
            api_url='',  # TODO: Fill with proper url <job>
            class_name='class_path_metadata'
        )
 
