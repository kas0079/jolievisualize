from .notificationInterface import NotificationIFace

service Notification {

    execution{ concurrent }

    inputPort IP {
        Location: "socket://localhost:4444"
        Protocol: sodep
        Interfaces: NotificationIFace
    }

    main {
        [ sendNotification(req) ] {
            nullProcess
        }
    }
}