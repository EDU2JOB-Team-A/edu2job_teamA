from rest_framework import generics, permissions, viewsets
from .serializers import UserSerializer, EducationSerializer, JobHistorySerializer, CustomTokenObtainPairSerializer
from .models import User, Education, JobHistory
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class EducationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EducationSerializer
    
    def get_queryset(self):
        return self.request.user.education.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = JobHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset to list and manage users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
