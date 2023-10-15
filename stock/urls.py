from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home),
    path('ajax_data/', views.ajax_data),
    path('stockanalyze/', views.stockanalyze),
    path('stockanalyze_ajax_data/', views.stockanalyze_ajax_data),
]