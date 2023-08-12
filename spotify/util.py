from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_tokens(session_id):
    # check if any tokens associated with the user
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)

    # token expires in 3600 seconds
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    # if we have tokens, we just update
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(
            user=session_id, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()

# check if user is already authenticated
def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expire = tokens.expires_in
        if expire <= timezone.now():
            # need to refresh token
            refresh_spotify_token(tokens, session_id)
        return True
    # not authenticated
    return False

def refresh_spotify_token(tokens, session_id):
    refresh_token = tokens.refresh_token

    # send request for refresh token
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    # new access token
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token)
    

# send request to Spotify api
def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token} # how to send the auth. token to Spotify (in documentation)

    # Post request
    if post_:
        post(BASE_URL + endpoint, headers=headers)
    # Put request
    if put_:
        put(BASE_URL + endpoint, headers=headers)
    
    # Get request
    response = get(BASE_URL + endpoint, {}, headers=headers)

    try:
        return response.json()
    except:
        return {'Error': 'Request issue'}
    
# request to spotify to pause and play
def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)

def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)

def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)

