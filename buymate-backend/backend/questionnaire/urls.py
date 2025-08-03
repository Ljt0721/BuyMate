from django.urls import path
from . import views

urlpatterns = [
    path('questionnaire_api/submit-pre-questionnaire/', views.submit_pre_questionnaire, name='submit_pre_questionnaire'),
    path('questionnaire_api/submit-post-questionnaire/', views.submit_post_questionnaire, name='submit_post_questionnaire'),
]
