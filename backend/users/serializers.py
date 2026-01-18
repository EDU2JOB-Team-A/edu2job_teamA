from rest_framework import serializers
from .models import User, Education, JobHistory, Skill, Certification, Feedback
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'profile_photo', 'banner_image', 'is_flagged', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True}, # Role change strictly via admin endpoint
            'is_flagged': {'read_only': True} # Changed via admin action
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super(UserSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super(UserSerializer, self).update(instance, validated_data)

class DetailedUserSerializer(UserSerializer):
    education = serializers.SerializerMethodField()
    job_history = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    certifications = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('education', 'job_history', 'skills', 'certifications')

    def get_education(self, obj):
        return EducationSerializer(obj.education.all(), many=True).data

    def get_job_history(self, obj):
        return JobHistorySerializer(obj.job_history.all(), many=True).data

    def get_skills(self, obj):
        return SkillSerializer(obj.skills.all(), many=True).data
    
    def get_certifications(self, obj):
        return CertificationSerializer(obj.certifications.all(), many=True).data


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ('user',)

class JobHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobHistory
        fields = '__all__'
        read_only_fields = ('user',)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ('user',)

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuing_organization', 'issue_date', 'expiration_date', 'credential_id', 'credential_url']
        read_only_fields = ['user']

class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Feedback
        fields = ['id', 'user', 'message', 'rating', 'created_at']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return data

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Support email login
        username = attrs.get('username')
        password = attrs.get('password')

        if username and '@' in username:
            try:
                user = User.objects.get(email=username)
                attrs['username'] = user.username
            except User.DoesNotExist:
                # Let it fail in super().validate()
                pass

        data = super().validate(attrs)

        # Add user details to response data (optional, but good for frontend)
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token

from .models import SupportTicket, TicketMessage

class TicketMessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    sender_role = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketMessage
        fields = ['id', 'sender', 'sender_role', 'message', 'is_admin_reply', 'created_at']
        
    def get_sender_role(self, obj):
        return obj.sender.role

class SupportTicketSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_email = serializers.ReadOnlyField(source='user.email')
    messages = TicketMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = ['id', 'user', 'user_username', 'user_email', 'subject', 'is_resolved', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['user', 'messages']
