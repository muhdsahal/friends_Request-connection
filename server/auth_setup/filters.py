from rest_framework import filters
from django.db.models import Q
from .models import User

class CustomSearchFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        search_param = request.query_params.get('search',None)
        if search_param:
            queryset = queryset.filter(
                Q(email__iexact=search_param) | Q(username__icontains=search_param)
            )
        return queryset