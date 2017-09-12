from rest_framework.response import Response
from api.exceptions import creation_failed_exception, update_failed_exception


class QueryCommonFiltering(object):

    query_set = None
    request = None

    sorted_by = None
    ordering = ""


    name = None
    app_id = None

    def __init__(self, query_set=None, request=None):
        self.query_set = query_set
        self.request = request

        if 'name' in request.query_params:
            temp_name = self.request.query_params.get('name')
            if temp_name is None or temp_name is "":
                self.name = self.name
            else:
                self.name = temp_name

        if 'app_id' in request.query_params:
            temp_app_id = self.request.query_params.get('app_id')
            if temp_app_id is None or temp_app_id is "":
                self.app_id = self.app_id
            else:
                self.app_id = int(temp_app_id)

        if 'sorted_by' in self.request.query_params:
            temp_name = self.request.query_params.get('sorted_by')
            if temp_name is None or temp_name is "":
                self.sorted_by = self.sorted_by
            else:
                if temp_name in ['name', 'created_at', 'updated_at']:
                    self.sorted_by = temp_name

        if 'ordering' in self.request.query_params:
            temp_name = self.request.query_params.get('ordering')
            if temp_name is None or temp_name is "":
                self.ordering = self.ordering
            else:
                if temp_name in ["-"]:
                    self.ordering = temp_name

    def execute_common_filtering_and_sorting_and_ordering(self):

        if self.name is not None:
            self.query_set = self.query_set.filter(name__contains=self.name)

        if self.app_id is not None:
            self.query_set = self.query_set.filter(app_id=self.app_id)

        if self.sorted_by is not None:
            query_args = "{0}{1}".format(self.ordering, self.sorted_by)
            self.query_set = self.query_set.order_by(query_args)
        return self.query_set


def get_listed_data(
        viewset=None,
        request=None,
        list_serializer=None
):
    """

    :param viewset: use to  get_queryset() / pagination_class
    :param request: use to query_params
    :param list_serializer: pass Listing Serializer
    :return:
    """
    query_set = viewset.get_queryset()

    # common filtering
    qcf = QueryCommonFiltering(
        query_set=query_set,
        request=request
    )
    query_set = qcf.execute_common_filtering_and_sorting_and_ordering()

    if 'page' in request.query_params:
        if request.query_params.get('page') == 'all':
            serializer = list_serializer(query_set, many=True)
            return Response({
                "data": serializer.data
            })
    page_class = viewset.pagination_class()
    page = page_class.paginate_queryset(
        queryset=query_set,
        request=request
    )

    serializer = list_serializer(page, many=True)
    return page_class.get_paginated_response(serializer.data)


def get_retrieve_data(
        viewset=None
):
    try:
        instance = viewset.get_object_from_all()
    except:
        return creation_failed_exception("File Doesn't exist.")

    if instance is None:
        return creation_failed_exception("File Doesn't exist.")

    serializer = viewset.serializer_class(instance=instance)
    return Response(serializer.data)