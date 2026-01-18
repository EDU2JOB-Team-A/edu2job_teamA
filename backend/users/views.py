from rest_framework import generics, permissions, viewsets
from .serializers import UserSerializer, EducationSerializer, JobHistorySerializer, CustomTokenObtainPairSerializer, SkillSerializer, CertificationSerializer, ChangePasswordSerializer
from .models import User, Education, JobHistory, Skill, Certification
from rest_framework.permissions import IsAuthenticated, AllowAny
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

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.skills.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CertificationViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.certifications.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            request.user.set_password(serializer.data.get("new_password"))
            request.user.save()
            return Response({"success": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

from .predictor import CareerPredictor
from .models import CareerPrediction

class PredictionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        # simple caching: if prediction exists and recent (TODO), return it.
        # For now, always predict fresh based on current skills.
        
        skills = list(user.skills.values_list('name', flat=True))
        
        # Also include education/history keywords? 
        # For MVP, just user.skills (Skill model)
        
        if not skills:
             return Response({"message": "Add skills to get career predictions"}, status=status.HTTP_200_OK)

        predictor = CareerPredictor()
        predictions = predictor.predict_roles(skills)
        
        # Save top prediction ? Or all? 
        # Requirement: "save into job history" -> probably separate model "CareerPrediction"
        # User requested: "save into job hystory" -> ambiguous. 
        # "Job History" is past jobs. "CareerPrediction" is future.
        # I created CareerPrediction model.
        
        # PERSIST HISTORY: Do NOT delete old predictions
        # CareerPrediction.objects.filter(user=user).delete()
        
        for p in predictions:
            # DEDUPLICATION: Update timestamp if role already exists
            CareerPrediction.objects.update_or_create(
                user=user,
                predicted_role=p['role'],
                defaults={
                    'match_percentage': p['match_percentage'],
                    'missing_skills': ",".join(p['missing_skills'])
                }
                # update_or_create automatically updates 'updated_at' due to auto_now=True
            )
            
        return Response(predictions, status=status.HTTP_200_OK)

class PredictionHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Order by updated_at so most recently refreshed predictions are top
        return CareerPrediction.objects.filter(user=self.request.user).order_by('-updated_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Custom serialization to handle missing_skills string
        data = []
        for p in queryset:
            data.append({
                "id": p.id,
                "role": p.predicted_role,
                "match_percentage": p.match_percentage,
                "missing_skills": p.missing_skills.split(',') if p.missing_skills else [],
                "created_at": p.created_at,
                "updated_at": p.updated_at
            })
        return Response(data)

    def get_queryset(self):
        # Ensure user can only delete their own predictions
        return CareerPrediction.objects.filter(user=self.request.user)

class PredictionDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CareerPrediction.objects.all()
    
    def get_queryset(self):
        # Ensure user can only delete their own predictions
        return CareerPrediction.objects.filter(user=self.request.user)

import requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify token with Google
            response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={token}')
            
            if response.status_code != 200:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
            
            google_data = response.json()
            email = google_data.get('email')
            name = google_data.get('name')
            
            # Trust email if email_verified is true
            if not google_data.get('email_verified'):
                return Response({'error': 'Email not verified by Google'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or Create User
            try:
                user = User.objects.get(username=email)
            except User.DoesNotExist:
                # Create user with random password
                user = User.objects.create_user(username=email, email=email, password=None)
                user.first_name = name or ""
                user.save()
            
            # Generate Tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
