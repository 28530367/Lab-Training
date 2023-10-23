from django.urls import path
from . import views

urlpatterns = [
    path('form/', views.form),
    path('ajax_data/', views.ajax_data),
    path('transcript/', views.transcript, name='transcript_page'),
    path('ajax_data_transcript/', views.ajax_data_transcript),
    path('pirscan_output/<str:pk>', views.pirscan_output, name='pirscan_output'),
    path('ajax_pirscan_output/', views.ajax_pirscan_output),
    path('clashfilter/', views.clashfilter),
    path('ajax_clashfilter/', views.ajax_clashfilter),
    path('rna_binding_site/', views.rna_binding_site),
    path('ajax_rna_binding_site/', views.ajax_rna_binding_site),
    path('ajax_rna_binding_site_search/', views.ajax_rna_binding_site_search),
]