from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import User,FriendRequest
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re
from .models import FriendRequest
from django.contrib.auth.password_validation import validate_password


# from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        min_length=settings.MIN_PASSWORD_LENGTH,
        error_messages={
            "min_length": "password must be longer than {} characters".format(
                settings.MIN_PASSWORD_LENGTH
            )
        }
    )
    
    password2 = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        min_length=settings.MIN_PASSWORD_LENGTH,
        error_messages={
            "min_length": "password must be longer than {} characters".format(
                settings.MIN_PASSWORD_LENGTH
            )
        }
    )

    email = serializers.EmailField(
        required=True,
        error_messages={
            "invalid": "Please enter a valid email address."
        }
    )

    profile_photo = serializers.ImageField(
        required=False,
        allow_null=True
    )
    
    password_pattern = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$"

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'password2', 'email', 'profile_photo','is_active']
        read_only_fields = ["id"]

    def validate(self, data):
        # Validate passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError("passwords do not match")
        
        # Validate password strength
        if not re.match(self.password_pattern, data['password']):
            raise serializers.ValidationError("password must be strong!")

        # Validate username length
        if len(data["username"]) < 3:
            raise serializers.ValidationError("username must be at least 3 characters long!")
        
        if len(data["username"]) > 20:
            raise serializers.ValidationError("username cannot be more than 20 characters long!")
        
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            raise serializers.ValidationError("email is not valid")

        return data

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            profile_photo=validated_data.get("profile_photo")  
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class UserTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_admin'] = user.is_superuser
        token['id'] = user.id
        token['username'] = user.username
        token['email'] = user.email
        token['is_active'] = user.is_active
        
        return token    
    


class UserDataSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class FriendRequestSerializer(ModelSerializer):
    from_user = UserDataSerializer(read_only=True)
    to_user = UserDataSerializer(read_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'timestamp', 'accepted']
