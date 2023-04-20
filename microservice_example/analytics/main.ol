from .analyticsInterface import AnalyticsIFace

service Analytics {

    execution{ concurrent }

    inputPort IP {
        Location: "socket://localhost:5554"
        Protocol: sodep
        Interfaces: AnalyticsIFace
    }

    main {
        [ addToLogs (req) ] {
            println@Console("Logged " + req.entry + " from: " + req.fromService)()
        }
    }
}