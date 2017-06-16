from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.response import Response

from api.views import dataset, errand, trainer, score


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def config_for_everyone(request, id, type):

    user = request.user
    id = id
    type = type

    pass