from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.conf import settings

class CustomPagination(PageNumberPagination):

    def get_paginated_response(self, data):
        return None

    def modified_get_paginate_response(self, page):
        # TODO: move the below exception handeling to some util function
        try:
            page_number = int(self.request.query_params.get('page_number', settings.PAGENUMBER))
        except ValueError:
            page_number = settings.PAGENUMBER
        try:
            page_size = int(self.request.query_params.get('page_size', settings.PAGESIZE))
        except ValueError:
            page_size = settings.PAGESIZE
        pagination = self.get_page_count(page, page_number, page_size)

        return Response({
            'data': pagination["current_data"],
            'total_number_of_pages': pagination['count'],
            'current_page': pagination['current_page'],
            'current_page_size': pagination['current_page_size'],
            'current_item_count': len(pagination["current_data"])
        })

    def get_page_count(self, page, page_number=1, page_size=10):
        if page_size < 1:
            page_size = 1
        total_data_count = len(page)
        if total_data_count < 1:
            return {
                "count": 0,
                "current_page": 0,
                "current_page_size": 0,
                "current_data": []
            }
        total_number_of_pages = ((total_data_count - 1) / page_size) + 1
        if page_number > total_number_of_pages:
            page_number = 1
            page_size = 10
        initial_count = (page_number - 1) * page_size
        end_count = initial_count + page_size
        page_data = page[initial_count:end_count]
        serialized_page_data = self.list_serializer(page_data, many=True)
        return {
            "count": total_number_of_pages,
            "current_page": page_number,
            "current_page_size": page_size,
            "current_data": serialized_page_data.data
        }

    def paginate_queryset(self,
                          queryset,
                          request,
                          view=None,
                          list_serializer=None
                          ):
        self.request = request
        self.view = view
        self.queryset = queryset
        self.list_serializer = list_serializer
        return queryset

