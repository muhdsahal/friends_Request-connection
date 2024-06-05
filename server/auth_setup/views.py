from .serializers import UserSerializer,UserTokenObtainPairSerializer,UserDataSerializer, FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView 
from .models import User,FriendRequest
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView,ListAPIView,UpdateAPIView,CreateAPIView
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .filters import CustomSearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.throttling import UserRateThrottle
from django.db.models import Q
# Create your views here.

class UserRegistrationListCreate(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def list(self,request,*args, **kwargs ):
        try:
            return super().list(request,*args, **kwargs)
        except Exception as e:
            return Response({'error':str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({'error':str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserTokenObtainPairView(TokenObtainPairView):
    serializer_class = UserTokenObtainPairSerializer
    


class SetPagination(PageNumberPagination):
    page_size = 10


class UserSearchThrottle(UserRateThrottle):
    rate = '10/min' 

class AllUsersView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SetPagination
    filter_backends = [DjangoFilterBackend,CustomSearchFilter]
    search_fileds = ['username','email',]
    throttle_classes = [UserSearchThrottle]

    def get_queryset(self):
        try:
            return User.objects.exclude(is_superuser=True)
        except Exception as e:
            return f" An error occured during fetching Api {str(e)}"


class SendFriendRequestThrottle(UserRateThrottle):
    rate = '3/minute'


class SendFriendRequestView(CreateAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [SendFriendRequestThrottle]


    def create(self, request, *args, **kwargs):
        to_req_user = request.data['to_user']
        to_user = User.objects.get(id=to_req_user)
        if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
            return Response({"detail": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)
        
        friend_request = FriendRequest.objects.create(
            from_user=request.user,
            to_user=to_user,
            request_status = 'pending'  # Explicitly set the status to 'pending'
        )
        return Response(FriendRequestSerializer(friend_request).data, status=status.HTTP_201_CREATED)



class AcceptRejectFriendRequestView(UpdateAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        friend_request = FriendRequest.objects.get(id=kwargs['pk'])
        if request.user != friend_request.to_user:
            print(request.data,'request.datarequest.datarequest.datarequest.data')
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        
        if 'request_status' in request.data:
            new_status = request.data['request_status']
            if new_status == 'accept':
                friend_request.request_status = 'accept'
            else:
                return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
            
            friend_request.save()
            return Response(FriendRequestSerializer(friend_request).data)
        
        return Response({"detail": "request_status not provided."}, status=status.HTTP_400_BAD_REQUEST)

  

class ListFriendsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FriendRequestSerializer
    pagination_class = SetPagination
    filter_backends = [DjangoFilterBackend,CustomSearchFilter]

    def get_queryset(self):
        
        user = self.request.user
        queryset = FriendRequest.objects.filter(from_user = user, request_status='accept')
        return queryset
        

class ListPendingRequestsView(ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = FriendRequest.objects.filter(from_user = user, accepted=False)
        return queryset