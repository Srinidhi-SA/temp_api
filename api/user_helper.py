from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import request, response
import uuid
from django.conf import settings

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save


class Profile(models.Model):
    user = models.OneToOneField(User, related_name='profile', primary_key=True, on_delete=models.CASCADE)
    photo = models.FileField(
        upload_to="profiles",
        max_length=255,
        null=True,
        blank=True
    )
    website = models.URLField(default='', blank=True)
    bio = models.TextField(default='', blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    city = models.CharField(max_length=100, default='', blank=True)
    country = models.CharField(max_length=100, default='', blank=True)
    organization = models.CharField(max_length=100, default='', blank=True)

    def json_serialized(self):
        image_url = settings.IMAGE_URL

        user_profile = {
            "image_url": image_url,
            "website": self.website,
            "bio": self.bio,
            "phone": self.phone
        }

        # user_profile.update(self.user)
        return user_profile


class UserProfileSerializer(serializers.Serializer):

    class Meta:
        model = Profile
        field = ('photo', 'website', 'bio', 'phone', 'city', 'country', 'organization')

    def create(self, validated_data):  #
        userprofile_data = validated_data.pop('userprofile')
        user = User.objects.create(**validated_data)  # Create the user object instance before store in the DB
        user.set_password(validated_data['password'])  # Hash to the Password of the user instance
        user.save()  # Save the Hashed Password
        Profile.objects.create(user=user, **userprofile_data)
        return user  # Return user object

    # def update(self, instance, validated_data):
    #     instance.photo = validated_data.get('image', instance.photo)
    #     instance.website = validated_data.get('website', instance.website)
    #     instance.phone = validated_data.get('phone', instance.phone)
    #
    #     instance.save()
    #     return instance


    def to_representation(self, instance):
        ret = super(UserProfileSerializer, self).to_representation(instance)
        ret['photo'] = instance.photo.path
        return ret


class UserSerializer(serializers.ModelSerializer):
    # user_profile = UserProfileSerializer(allow_null=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined")


def jwt_response_payload_handler(token, user=None, request=None):

    # print user.date_joined - datetime.datetime.now(tz=)
    # if  (timezone.now() - user.date_joined).days > 30:
    #     return {
    #         'error': "Subscription expired."
    #     }
    profile = Profile.objects.filter(user=user).first()

    if profile is None:
        profile = Profile(user=user)
        profile.save()

    return {
        'token': "JWT " + token,
        'user': UserSerializer(user, context={'request': request}).data,
        'profile': profile.json_serialized() if profile is not None else None
    }


def create_profile(sender, **kwargs):
    user = kwargs["instance"]
    if kwargs["created"]:
        user_profile = Profile(user=user)
        user_profile.save()

post_save.connect(create_profile, sender=User)


from rest_framework import viewsets, generics
from rest_framework.response import Response

from rest_framework.decorators import api_view

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['PUT'])
def upload_photo(request):
    user = request.user

    image = request.FILES.get('image')
    other_details = request.POST
    print other_details.get('website')

    data = dict()
    data['image'] = image
    if 'website' in other_details:
        data['website'] = other_details.get('website')

    if 'bio' in other_details:
        data['bio'] = other_details.get('bio')

    if 'phone' in other_details:
        data['phone'] = other_details.get('phone')

    # data['user'] = user
    obj = Profile.objects.filter(user=user).first()

    if obj is None:
        obj = Profile(user=user)
        obj.save()

    obj.photo = image
    obj.website = data['website']
    obj.bio = data['bio']
    obj.phone = data['phone']
    obj.save()


    # serializer = UserProfileSerializer(
    #     instance=obj,
    #     data=data,
    #     partial=True
    # )
    #
    # if serializer.is_valid():
    #     obj = serializer.save()
    #     return Response(serializer.data)

    # user.user_profile.photo = image
    # user.save()
    return Response(obj.json_serialized())


@csrf_exempt
@api_view(['GET'])
def get_profile_image(request):

    if request.user.profile is None:
        return Response({'message': 'No Image. Upload an image.'})
    import magic
    from django.http import HttpResponse
    import os

    image = request.user.profile.photo
    image_buffer = open(
        name=image.path,
        mode="rb"
    ).read()
    content_type = magic.from_buffer(image_buffer, mime=True)
    response = HttpResponse(image_buffer, content_type=content_type)
    response['Content-Disposition'] = 'attachment; filename="%s"' % os.path.basename(image.path)
    return response





class UserProfileView(generics.CreateAPIView, generics.UpdateAPIView):

    def get_queryset(self):
        pass

    def get_serializer(self, *args, **kwargs):
        return Profile

    def create(self, request, *args, **kwargs):
        data = request.data
        serializers = self.get_serializer()
        ser = serializers(data = data)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)

        return Response({'message': 'Failed'})

    def update(self, request, *args, **kwargs):
        data = request.data
        user = request.user