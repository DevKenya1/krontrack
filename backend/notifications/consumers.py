import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return

        self.group_name = f'notifications_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        unread = await self.get_unread_count(user)
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'unread_count': unread,
        }))

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'mark_read':
            await self.mark_notification_read(data.get('id'))

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event['id'],
            'title': event['title'],
            'message': event['message'],
            'notification_type': event['notification_type'],
            'action_url': event.get('action_url', ''),
            'created_at': event['created_at'],
        }))

    @database_sync_to_async
    def get_unread_count(self, user):
        try:
            return user.employee_profile.notifications.filter(is_read=False).count()
        except Exception:
            return 0

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        from .models import Notification
        from django.utils import timezone
        try:
            Notification.objects.filter(id=notification_id).update(
                is_read=True, read_at=timezone.now()
            )
        except Exception:
            pass
