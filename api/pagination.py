from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.conf import settings

class CustomPagination(PageNumberPagination):
    def get_paginated_response(self, data):

        # TODO: move the below exception handeling to some util function
        try:
            page_number = int(self.request.query_params.get('page_number', settings.PAGENUMBER))
        except Exception as e:
            page_number = settings.PAGENUMBER
        try:
            page_size = int(self.request.query_params.get('page_size', settings.PAGESIZE))
        except Exception as e:
            page_size = settings.PAGESIZE

        pagination = self.get_page_count(data, page_number, page_size)
        return Response({
            'data': pagination["current_data"],
            'total_number_of_pages': pagination['count'],
            'current_page': pagination['current_page'],
            'current_page_size': pagination['current_page_size'],
            'current_item_count': len(pagination["current_data"])
        })

    def get_page_count(self, data, page_number=1, page_size=10):
        if page_size < 1:
            page_size = 1
        total_data_count = len(data)
        if total_data_count < 1:
            return {
                "count": 0,
                "current_page": 0,
                "current_page_size": 0,
                "current_data": []
            }
        total_number_of_pages = (total_data_count / page_size) + 1
        if page_number > total_number_of_pages:
            page_number = 1
            page_size = 10
        initial_count = (page_number - 1) * page_size
        end_count = initial_count + page_size
        page_data = data[initial_count:end_count]

        return {
            "count": total_number_of_pages,
            "current_page": page_number,
            "current_page_size": page_size,
            "current_data": page_data
        }