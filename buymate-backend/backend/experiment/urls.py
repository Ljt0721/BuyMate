from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.get_products_by_experiment_id, name='get_products_by_experiment_id'),
    path('experiment/submit/', views.submit_experiment_info, name='submit_experiment_info'),
]
