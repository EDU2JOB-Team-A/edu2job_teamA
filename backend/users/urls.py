from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, EducationViewSet, JobHistoryViewSet, CustomTokenObtainPairView, UserViewSet
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'education', EducationViewSet, basename='education')
router.register(r'job-history', JobHistoryViewSet, basename='job-history')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
