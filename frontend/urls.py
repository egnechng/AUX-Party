from django.urls import path
from .views import index

# django needs to know that this urls belongs to the frontend app
app_name = 'frontend'

urlpatterns = [
    path('', index, name=''),
    path('join', index),
    path('info', index),
    path('create', index),
    path('room/<str:roomCode>', index),
]