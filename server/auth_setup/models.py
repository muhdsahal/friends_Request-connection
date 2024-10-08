from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    username = models.CharField(max_length=250,null=True,unique=True)
    email = models.EmailField(max_length=250,unique=True)
    # password1 = models.CharField(max_length=250)
    # password2 = models.CharField(max_length=250)
    profile_photo = models.ImageField(upload_to='profile',blank=True,null=True)
    


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    

class FriendRequest(models.Model):
    STATUS_TYPES = (
        ('request', 'request'),
        ('pending', 'pending'),
        ('accept', 'accept'),
    )
    
    from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    request_status = models.CharField(max_length=20,choices=STATUS_TYPES ,default='request')

    class Meta:
        unique_together = ('from_user', 'to_user')

    def save(self, *args, **kwargs):
        if not self.pk:  
            self.request_status = 'pending'
        super().save(*args, **kwargs)

