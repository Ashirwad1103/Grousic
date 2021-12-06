from django.urls import path
from rest_framework.generics import UpdateAPIView
from .views import GetRoomView, JoinRoomView, LeaveRoom, RoomView, CreateRoomView, UpdateRoomView, UserInRoom

urlpatterns = [
    path('create-room', CreateRoomView.as_view()),
    path('room', RoomView.as_view()),
    path('get-room' , GetRoomView.as_view()),     #not sure about this url...
    path('join-room', JoinRoomView.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('update-room', UpdateRoomView.as_view()),
]
