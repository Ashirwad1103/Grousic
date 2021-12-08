from django.db.models.fields import NullBooleanField
from django.http.response import JsonResponse
from django.shortcuts import render, HttpResponse
from rest_framework import generics, serializers, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response



# Create your views here.

# Api View 


class RoomView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


# Update room view 
class UpdateRoomView(APIView) :
    
    serializer_class = UpdateRoomSerializer
    
    def patch(self, request, format = None) :
        
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create() 

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            host = self.request.session.session_key 
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            queryset = Room.objects.filter(host = host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields = ['guest_can_pause', 'votes_to_skip'])
                return Response(RoomSerializer(room).data, status = status.HTTP_200_OK)
            return Response({'BAD REQUEST' : 'YOU ARE NOT THE HOST OF THIS ROOM'}, status=status.HTTP_400_BAD_REQUEST) 
        return Response({'BAD REQUEST' : 'YOU ARE NOT THE HOST OF THIS ROOM'}, status=status.HTTP_403_FORBIDDEN)

# Leave Room 

class LeaveRoom(APIView) :
    def post(self, request, format = None) :
        self.request.session.pop('room_code')
        user = self.request.session.session_key 
        
        room = Room.objects.filter(host = user).first()
        if room :
            room.delete()
        return Response({'MESSAGE' : 'SUCCESS'} , status = status.HTTP_200_OK)

class UserInRoom (APIView) :

    def get(self, request, format = None):
        
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create() 
             
        roomCode = self.request.session.get('room_code')

        data = {
            'code' : roomCode
        }
    
        return JsonResponse(data, status = status.HTTP_200_OK)


class GetRoomView(APIView) :
    serializer_class = RoomSerializer
    lookup_url_kwargs = 'code'

    def get(self, request, format = None):
        code = request.GET.get(self.lookup_url_kwargs) 
        if code != None :
            room = Room.objects.filter(code = code).first()
            if room : 
                data = self.serializer_class(room).data 
                data['isHost'] = self.request.session.session_key == room.host
                return Response(data, status = status.HTTP_200_OK)
            else:
                return Response({'BAD REQUEST': 'ROOM COULD NOT BE FOUND FOR THIS CODE'}, status = status.HTTP_400_BAD_REQUEST)
        return Response({'BAD REQUEST' : 'CODE IS REQUIRED'} , status = status.HTTP_400_BAD_REQUEST)

# 'room_code' is room code of currently joined room by this particular user  

class JoinRoomView(APIView):
    lookup_url_kwargs = 'code'

    def post(self, request, format = None):

        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create() 
        
        code = request.data.get(self.lookup_url_kwargs)
        if code != None :
            room = Room.objects.filter(code = code).first()
            if room :
                self.request.session['room_code'] = room.code
                return Response({'MESSAGE' : 'ROOM JOINED SUCCESSFULLY'}, status = status.HTTP_200_OK)
            
            return Response({'BAD REQUEST' : 'ROOM WITH THIS CODE DOES NOT EXIST'}, status = status.HTTP_400_BAD_REQUEST)
        
        return Response({'BAD REQUEST' : 'CODE IS REQUIRED'} , status = status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):

    serializer_class = CreateRoomSerializer
    
    # 'serializer' below is just like args 

    def post(self, request, format = None):
        
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create() 

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            host = self.request.session.session_key 
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            queryset = Room.objects.filter(host = host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip 
                self.request.session['room_code'] = room.code                
                room.save(update_fields = ['guest_can_pause', 'votes_to_skip'])
                return Response(RoomSerializer(room).data, status = status.HTTP_200_OK)
            else:
                room = Room(host = host, guest_can_pause = guest_can_pause, votes_to_skip = votes_to_skip)
                self.request.session['room_code'] = room.code                
                room.save()
                return Response(RoomSerializer(room).data, status = status.HTTP_201_CREATED)

        return Response({'Bad Resquest' : 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

