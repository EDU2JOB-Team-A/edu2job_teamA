from rest_framework import generics, permissions, viewsets
from .serializers import UserSerializer, EducationSerializer, JobHistorySerializer, CustomTokenObtainPairSerializer, SkillSerializer, CertificationSerializer, ChangePasswordSerializer, FeedbackSerializer, DetailedUserSerializer
from .models import User, Education, JobHistory, Skill, Certification, Feedback, CareerPrediction

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
        
import os


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

    def perform_update(self, serializer):
        instance = serializer.instance
        if 'is_flagged' in self.request.data:
             instance.is_flagged = self.request.data['is_flagged']
             instance.save()
        super().perform_update(serializer)


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
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DetailedUserSerializer
        return UserSerializer

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
        # Allow Admin to delete any, User to delete own
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return CareerPrediction.objects.all()
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
            user = User.objects.filter(email=email).first()
            if not user:
                # Create user with random password
                # Handle potential username collision by appending random string if needed, 
                # but for now assuming email as username is desired pattern.
                if User.objects.filter(username=email).exists():
                     # Fallback if username taken but email not associated (rare)
                     import uuid
                     user = User.objects.create_user(username=f"{email}_{uuid.uuid4().hex[:8]}", email=email, password=None)
                else:
                     user = User.objects.create_user(username=email, email=email, password=None)
                
                user.first_name = name or ""
                user.save()
            
            # Generate Tokens using CustomTokenObtainPairSerializer to ensure claims like 'role' are present
            token = CustomTokenObtainPairSerializer.get_token(user)

            return Response({
                'refresh': str(token),
                'access': str(token.access_token),
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'role': user.role
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Feedback.objects.all().order_by('-created_at')
        return Feedback.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from django.db.models import Count
from django.db.models.functions import TruncDate

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        recent_users = User.objects.order_by('-date_joined')[:5]
        
        # Career Prediction Trends (Top 5 roles)
        top_roles = CareerPrediction.objects.values('predicted_role')\
            .annotate(count=Count('predicted_role'))\
            .order_by('-count')[:5]

        # Recent Feedback
        recent_feedback = Feedback.objects.order_by('-created_at')[:5]

        # Recent Predictions (System-wide Logs)
        recent_predictions = CareerPrediction.objects.all().order_by('-created_at')[:20]
        
        # Simple serialization for prediction logs
        predictions_data = []
        for p in recent_predictions:
            predictions_data.append({
                "id": p.id,
                "user": p.user.username,
                "role": p.predicted_role,
                "match": p.match_percentage,
                "created_at": p.created_at,
                "is_flagged": p.is_flagged
            })

        # Flagged Predictions (for review)
        flagged_predictions = CareerPrediction.objects.filter(is_flagged=True).order_by('-created_at')
        flagged_data = []
        for p in flagged_predictions:
            flagged_data.append({
                "id": p.id,
                "user": p.user.username,
                "role": p.predicted_role,
                "match": p.match_percentage,
                "created_at": p.created_at
            })

        data = {
            "total_users": total_users,
            "recent_users": UserSerializer(recent_users, many=True).data,
            "top_roles": top_roles,
            "recent_feedback": FeedbackSerializer(recent_feedback, many=True).data,
            "prediction_logs": predictions_data,
            "flagged_predictions": flagged_data
        }
        return Response(data)


class TrainingDataView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({'error': 'File must be CSV'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save file to ml/temp_career_data.csv first
        temp_path = os.path.join(settings.BASE_DIR, 'ml', 'temp_career_data.csv')
        final_path = os.path.join(settings.BASE_DIR, 'ml', 'career_data.csv')
        
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        try:
            with open(temp_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
                    
            # Validate by trying to load with Predictor
            # We temporarily patch settings or Predictor to load this specific file?
            # Or just update Predictor to accept a path arg.
            
            # Since Predictor hardcodes path in _train_model, we can swap files if we want to test,
            # BUT better to modify Predictor to take path. However, to minimize changes,
            # we can use a helper class or just check columns manually here using pandas?
            # No, let's just inspect it.
            
            import pandas as pd
            df = pd.read_csv(temp_path)
            if 'Skills' not in df.columns or 'Job_Role' not in df.columns:
                os.remove(temp_path)
                return Response({'error': "Invalid CSV format. Required columns: 'Skills', 'Job_Role'"}, status=status.HTTP_400_BAD_REQUEST)
            
            if len(df) < 5:
                os.remove(temp_path)
                return Response({'error': "Dataset too small. Please provide at least 5 records."}, status=status.HTTP_400_BAD_REQUEST)

             # If valid, replace old file
            if os.path.exists(final_path):
                os.remove(final_path)
            os.rename(temp_path, final_path)
            
            # Retrain global model
            from .predictor import CareerPredictor
            CareerPredictor() # Re-init triggers retraining
            
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return Response({'error': f'Failed to process file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Training data updated and model retrained successfully!'}, status=status.HTTP_200_OK)

class PredictionFeedbackView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            prediction = CareerPrediction.objects.get(pk=pk)
            # Toggle flag
            prediction.is_flagged = not prediction.is_flagged
            prediction.save()
            return Response({'status': 'success', 'is_flagged': prediction.is_flagged}, status=status.HTTP_200_OK)
        except CareerPrediction.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=status.HTTP_404_NOT_FOUND)

from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return SupportTicket.objects.all().order_by('-updated_at')
        return SupportTicket.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk)
            # Permission check: Admin or Ticket Owner
            if request.user != ticket.user and request.user.role != 'admin' and not request.user.is_staff:
                 return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            message_text = request.data.get('message')
            if not message_text:
                return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

            is_admin = request.user.role == 'admin' or request.user.is_staff

            TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                message=message_text,
                is_admin_reply=is_admin
            )
            
            # Update ticket timestamp
            ticket.save() 
            
            return Response({'status': 'Message sent'}, status=status.HTTP_201_CREATED)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)



