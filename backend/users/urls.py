from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, EducationViewSet, JobHistoryViewSet, CustomTokenObtainPairView, UserViewSet, SkillViewSet, CertificationViewSet, ChangePasswordView, UserProfileView, PredictionView, PredictionHistoryView, PredictionDeleteView, GoogleLoginView, FeedbackViewSet, AdminDashboardStatsView, TrainingDataView, PredictionFeedbackView, SupportTicketViewSet, TicketMessageView

from .resume_view import ResumeView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'education', EducationViewSet, basename='education')
router.register(r'job-history', JobHistoryViewSet, basename='job-history')
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'certifications', CertificationViewSet, basename='certifications')
router.register(r'users', UserViewSet, basename='users')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'support/tickets', SupportTicketViewSet, basename='support_tickets')


urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('generate-resume/', ResumeView.as_view(), name='generate_resume'),
    path('predict-career/', PredictionView.as_view(), name='predict_career'),
    path('prediction-history/', PredictionHistoryView.as_view(), name='prediction_history'),
    path('prediction-delete/<int:pk>/', PredictionDeleteView.as_view(), name='prediction_delete'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('admin/upload-data/', TrainingDataView.as_view(), name='admin_upload_data'),
    path('prediction/flag/<int:pk>/', PredictionFeedbackView.as_view(), name='prediction_flag'),
    path('support/tickets/<int:pk>/message/', TicketMessageView.as_view(), name='ticket_message'),

    path('', include(router.urls)),
]
