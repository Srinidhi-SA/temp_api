from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.response import Response

from django.shortcuts import redirect
from django.shortcuts import render

from api.views import dataset, errand, trainer, score


def get_function(type):

    fun = {
        'dataset': dataset.get_all_dataset,
        'errand': errand.get_all_errand,
        'trainer': trainer.get_all_trainers,
        'score': score.get_all_score
    }

    return fun[type]


def get_function_id(type):

    fun = {
        'dataset': dataset.get_dataset_from_data_from_id,
        'errand': errand.get_errand_from_id,
        'trainer': trainer.get_trainer_using_id,
        'score': score.get_score_using_id
    }

    return fun[type]


def get_config_path(type, obj):

    if type == "dataset":
        return "uploads/datasets/{0}/client_data.csv".format(obj.id)
    elif type == 'errand':
        return obj.config_file_path
    elif type == "trainer":
        return obj.get_local_config_path()
    elif type == "score":
        return obj.get_local_config_file()
    # fun = {
    #     'dataset': ,
    #     'errand': obj.config_file_path,
    #     'trainer': obj.get_local_config_path,
    #     'score': obj.get_local_config_file
    # }

    return None


def get_results(fun, id):
    return fun(id)


def read_file(path):
    content = []
    with open(path, 'r') as file:
        for line in file:
            content.append(line)
    return content


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def database_name(request, type):

    user = request.user
    type = type

    fun = get_function(type)
    results = get_results(fun, user.id)

    details = [[str(result.id), result.input_file.name if type == 'dataset' else result.name] for result in results]
    print details

    return render(request ,'config/config.html', {'details':details, 'type':type, 'user':user})


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def database_name_particular(request, type, id):

    user = request.user
    type = type
    id = id

    fun = get_function_id(type)
    result = get_results(fun, id)

    configpath = get_config_path(type, result)
    contents = read_file(configpath)
    return render(request, 'config/file.html', {'contents':contents})
