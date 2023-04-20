from .notificationTypes import Notification

interface NotificationIFace {
    OneWay:
        sendNotification(Notification)
}