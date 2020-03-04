"""
Commomly used queries implementations for increased re-usability.
"""
# from itertools import chain
# from builtins import object
import ast
from rest_framework.response import Response
#from api.exceptions import creation_failed_exception, update_failed_exception
#from django.db.models import Q

# -------------------------------------------------------------------------------
# pylint: disable=too-many-ancestors
# pylint: disable=no-member
# pylint: disable=too-many-return-statements
# pylint: disable=too-many-locals
# pylint: disable=too-many-branches
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# pylint: disable=too-few-public-methods
# pylint: disable=literal-comparison
# -------------------------------------------------------------------------------


class QueryCommonFiltering:
    """
    Performs commonly used query filtering.
    """
    query_set = None
    request = None
    sorted_by = None
    ordering = ""
    filter_fields = None
    name = None
    status = None
    confidence = None
    first_name = None

    def __init__(self, query_set=None, request=None):
        self.query_set = query_set
        self.request = request
        # self.top_3 = query_set

        if 'name' in request.query_params:
            temp_name = self.request.query_params.get('name')
            if temp_name is None or temp_name is "":
                self.name = self.name
            else:
                self.name = temp_name

        if 'first_name' in request.query_params:
            temp_name = self.request.query_params.get('first_name')
            if temp_name is None or temp_name is "":
                self.first_name = self.first_name
            else:
                self.first_name = temp_name

        if 'status' in request.query_params:
            temp_name = self.request.query_params.get('status')
            if temp_name is None or temp_name is "":
                self.status = self.status
            else:
                self.status = temp_name

        if 'confidence' in request.query_params:
            temp_name = self.request.query_params.get('confidence')
            if temp_name is None or temp_name is "":
                self.confidence = self.confidence
            else:
                self.confidence = temp_name

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

        if 'filter_fields' in request.query_params:
            temp_app_filter = self.request.query_params.get('filter_fields')
            if temp_app_filter is None or temp_app_filter is "" or temp_app_filter is []:
                self.filter_fields = self.filter_fields
            else:
                self.filter_fields = temp_app_filter

    def execute_common_filtering_and_sorting_and_ordering(self):
        """
        Method that handles filtering, sorting and ordering.
        """
        if self.first_name is not None:
            self.query_set = self.query_set.filter(first_name__icontains=self.first_name)
        if self.name is not None:
            self.query_set = self.query_set.filter(name__icontains=self.name)
        if self.confidence is not None:
            confidence_mapping_dict = {'E': 'Equal', 'G': 'Greater than', 'L': 'Less than'}
            self.query_set = self.query_set.filter(confidence=confidence_mapping_dict[self.confidence])
        if self.status is not None:
            status_mapping_dict = {'R': 'Ready to recognize.', 'V': 'Ready to verify.', 'E': 'Ready to export.'}
            self.query_set = self.query_set.filter(status=status_mapping_dict[str(self.status)])
        if self.filter_fields is not None:
            self.filter_fields = self.filter_fields.replace(',', '\",\"').replace('[', '[\"').replace(']', '\"]')
            self.filter_fields = ast.literal_eval(self.filter_fields)
            final_query_set = self.query_set.none()

            for tag in self.filter_fields:
                query_set_temp = self.query_set.filter(tags__icontains=tag).distinct()
                final_query_set = (final_query_set | query_set_temp).distinct()
            self.query_set = final_query_set
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
        request=request,
        list_serializer=list_serializer,
        view=viewset
    )

    resp = page_class.modified_get_paginate_response(page)
    return resp


def get_image_list_data(viewset, queryset, request, serializer):
    """
    Method that returns paginated response pertaining to images GET call.
    """
    qcf = QueryCommonFiltering(
        query_set=queryset,
        request=request
    )
    query_set = qcf.execute_common_filtering_and_sorting_and_ordering()

    if 'page' in request.query_params:
        if request.query_params.get('page') == 'all':
            serializer = serializer(query_set, many=True)
            return Response({
                "data": serializer.data
            })
    page_class = viewset.pagination_class()
    page = page_class.paginate_queryset(
        queryset=query_set,
        request=request,
        list_serializer=serializer,
        view=viewset
    )

    resp = page_class.modified_get_paginate_response(page)
    return resp

def get_specific_listed_data(
        viewset=None,
        request=None,
        list_serializer=None,
        role=None
):
    """

    :param viewset: use to  get_queryset() / pagination_class
    :param request: use to query_params
    :param list_serializer: pass Listing Serializer
    :return:
    """
    query_set = viewset.get_specific_reviewer_qyeryset(role)

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
        request=request,
        list_serializer=list_serializer,
        view=viewset
    )

    resp = page_class.modified_get_paginate_response(page)
    return resp
