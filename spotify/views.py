from django.shortcuts import render,redirect
from requests import Request, api, post
from rest_framework.views import APIView

from .models import Vote
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.response import Response
from rest_framework import status
from .util import *
from api.models import Room
# Create your views here.

# Generate url for authorization 
class AUTHURL(APIView):
    
    def get(self, request, format = None) :

        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET','https://accounts.spotify.com/authorize', params = {
            'client_id' : CLIENT_ID, 
            'response_type' : 'code', 
            'redirect_uri' : REDIRECT_URI, 
            'scope' : scopes
        }).prepare().url 

        return Response({'url' : url}, status = status.HTTP_200_OK)


def spotify_callback(request, format = None) :
    
    code = request.GET.get('code')
    error = request.GET.get('error') 

    response = post('https://accounts.spotify.com/api/token', data = {
        'client_id' : CLIENT_ID,
        'client_secret' : CLIENT_SECRET,
        'grant_type' : 'authorization_code', 
        'code' : code, 
        'redirect_uri' : REDIRECT_URI, 
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    create_or_update_spotify_tokens(request.session.session_key, access_token, refresh_token, 
                                            token_type, expires_in)

    return redirect('frontend:')

class IsAuthenticated(APIView):

    def get(self, request, format = None):
        # isAuthenticated = is_Authenticated()
        # if not self.request.session.exists(self.request.session.session_key):
        #     self.request.session.create()
            
        isAuthenticated = is_spotify_authenticated(self.request.session.session_key) 

        print(isAuthenticated)

        return Response({'status' : isAuthenticated}, status = status.HTTP_200_OK)

class CurrentSong(APIView) :

    def get (self, request, format = None) :
        room_code=self.request.session.get('room_code')
        print(room_code)
        room = Room.objects.filter(code = room_code)
        if room.exists():
            room = room[0]
        else : 
            return Response({}, status = status.HTTP_404_NOT_FOUND)

        host = room.host 

        endpoint = "player/currently-playing"

        response = execute_spotify_api_request(session_id = host, endpoint=endpoint) 

        if 'error' in response or 'item' not in response :
            return Response({'status' : 'issue with response'}, status = status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        title = item.get('name')
        progress_ms = response.get('progress_ms')
        duration_ms = item.get('duration_ms')
        is_playing = response.get('is_playing')
        song_id = item.get('id')
        image_url = item.get('album').get('images')[0].get('url')
        i = 0
        artists =''

        for artist in item.get('artists'):
            if i :
                artists += ', '
            artists += artist.get('name')
            i += 1 

        update_room_song(room, song_id)

        votes = Vote.objects.filter(song_id = room.current_song, room = room)


        song = {
            'title' : title,
            'artists' : artists,
            'duration' : duration_ms,
            'progress' : progress_ms,
            'image_url' : image_url,
            'is_playing' : is_playing,
            'votes' : len(votes),
            'total_votes' : room.votes_to_skip,
            'id' : song_id, 
        }

        return Response(song, status=status.HTTP_200_OK)    


def update_room_song(room, song_id):
    
    votes = Vote.objects.filter(song_id = room.current_song, room = room)
    if room.current_song != song_id:
        votes.delete()
        room.current_song = song_id
        room.save(update_fields = ['current_song'])


class PlaySong(APIView) :
    def put (self, request, format = None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code = room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause :
            play_song(room.host)
            return Response({}, status = status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class PauseSong(APIView) :
    def put (self, request, format = None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code = room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause :
            pause_song(room.host)
            return Response({}, status = status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    
    def post (self, request, format = None) :
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code = room_code)[0]
        votes = Vote.objects.filter(song_id = room.current_song, room = room)
        if self.request.session.session_key == room.host or len(votes) + 1 >= room.votes_to_skip:
            votes.delete()
            skip_song(room.host)
        else :
            newVote = Vote(user = self.request.session.session_key,song_id = room.current_song, room = room) 
            newVote.save()

        return Response({}, status = status.HTTP_204_NO_CONTENT)