from .paymentInterface import PaymentIFace
from ..analytics import AnalyticsIFace
from ..notification import NotificationIFace

service Payment {

    execution{ concurrent }

    inputPort IP {
        Location: "socket://localhost:10000"
        Protocol: sodep
        Interfaces: PaymentIFace
    }

    outputPort Notification {
        Location: "socket://localhost:4444"
        Protocol: sodep
        Interfaces: NotificationIFace
    }

    outputPort Analytics {
        Location: "socket://localhost:5554"
        Protocol: sodep
        Interfaces: AnalyticsIFace
    }

    main {
        [ processPayment(req)(res) {
            addToLogs@Analytics({
                fromService = "payment"
                entry = "payment processed"
            })
            sendNotification@Notification({
                userID = req.userID
                content = "Payment has been processed"
            })
        } ]
    }
}