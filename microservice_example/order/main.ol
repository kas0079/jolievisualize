from ..notification.notificationInterface import NotificationIFace
from ..analytics.analyticsInterface import AnalyticsIFace
from ..payment.paymentInterface import PaymentIFace

service Order {
    execution{ concurrent }

    inputPort IP {
        Location: "socket://localhost:5432"
        Protocol: sodep
        Interfaces: OrderIFace
    }

    outputPort Payment {
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
        [ placeOrder (req)(res) {
            nullProcess
        } ]

        [ getOrder (req)(res) {
            nullProcess
        }]

        [ cancelOrder(req)(res) {
            nullProcess
        }]
    }
}
