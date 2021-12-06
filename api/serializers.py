from django.db.models import fields
from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip','created_at')


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room 
        fields = ('guest_can_pause', 'votes_to_skip')
    

# this implementation is not according to tim 
class UpdateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room 
        fields = ('guest_can_pause', 'votes_to_skip')