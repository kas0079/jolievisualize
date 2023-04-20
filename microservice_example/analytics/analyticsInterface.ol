
from .analyticsTypes import AnalyticsRequest

interface AnalyticsIFace {
    OneWay:
        addToLogs(AnalyticsRequest)
}