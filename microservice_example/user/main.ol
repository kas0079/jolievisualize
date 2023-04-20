from .userInterface import UserIFace
from ..analytics.analyticsInterface import AnalyticsIFace

service User {
    execution{ concurrent }

    inputPort UserInput {
        Location: "socket://localhost:8888"
        Protocol: sodep
        Interfaces: UserIFace
    }

    outputPort Analytics {
        Location: "socket://localhost:5554"
        Protocol: sodep
        Interfaces: AnalyticsIFace
    }

    main
    {
        [ register( req )( res ) {
            res.code = 200
            res.error = false
            res.message = "";
            addToLogs@Analytics({
                fromService = "user"
                entry = "Registered user " + req.username
            })
        } ]

        [ login ( req ) ( res ) {
            res.code = 200
            res.error = false
            res.message = ""
            res.auth_token = "arst"
            addToLogs@Analytics({
                fromService = "user"
                entry = "Logged in user " + req.username
            })
        } ]

        [ deleteUser ( req ) ( res ) {
            res.code = 200
            res.error = false
            res.message = ""
            addToLogs@Analytics({
                fromService = "user"
                entry = "Deleted user " + req.username
            })
        } ]

        [ updateUser ( req ) ( res ) {
            res.code = 200
            res.error = false
            res.message = ""
            addToLogs@Analytics({
                fromService = "user"
                entry = "Updated user " + req.username
            })
        } ]
    }
}
