from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']

    def get_queryset(self):
        employee = self.request.user.employee_profile
        return Notification.objects.filter(recipient=employee)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.read_at = timezone.now()
        notif.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        employee = request.user.employee_profile
        Notification.objects.filter(recipient=employee, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({'status': 'all notifications marked as read'})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        employee = request.user.employee_profile
        count = Notification.objects.filter(recipient=employee, is_read=False).count()
        return Response({'unread_count': count})
