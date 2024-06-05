from django.urls import path
from .views import (UserRegistrationListCreate,UserTokenObtainPairView,AllUsersView,
                    SendFriendRequestView, AcceptRejectFriendRequestView, 
                    ListFriendsView, ListPendingRequestsView
                    )
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('user_register/',UserRegistrationListCreate.as_view(),name='user_register'),
    path("token/", UserTokenObtainPairView.as_view(), name="token"),
    path('token/refresh/',TokenRefreshView.as_view(),name='refresh-token'),
    path("all_users/", AllUsersView.as_view(), name="all_users"),
    path('send_friend_request/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('accept_reject_friend_request/<int:pk>/', AcceptRejectFriendRequestView.as_view(), name='accept-reject-friend-request'),
    path('friends/', ListFriendsView.as_view(), name='list-friends'),
    path('pending_requests/', ListPendingRequestsView.as_view(), name='list-pending-requests'),


    
]
