from .interfaces.trafficInterface import TrafficInterface
include "config.iol"

service Traffic {

    execution{ concurrent }

    inputPort Traffic {
        Location: Traffic_location
        Protocol: sodep
        Interfaces: TrafficInterface
    }

    main {
    getData( request )( response ) {
        if ( request.city == "Rome" ) {
        response = "High"
        } else if ( request.city == "Cesena" ) {
        response = "Low"
        } else {
        response = "Medium"
        }
    }
    }
}