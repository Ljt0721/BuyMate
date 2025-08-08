from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.get_products_by_experiment_id, name='get_products_by_experiment_id'),
    path('experiment/submit/', views.submit_experiment_info, name='submit_experiment_info'),
    path('experiment/result/', views.get_experiment_result, name='get_experiment_result'),
    path('experiment/ai_translation/', views.get_ai_translation, name='get_ai_translation'),
    path('experiment/get_audio/', views.get_audio, name='get_audio'),
    path('experiment/download_db/', views.download_db, name='download_db'),
]
