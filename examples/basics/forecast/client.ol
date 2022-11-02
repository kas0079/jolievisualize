from console import Console
from .interfaces.infoInterface import GetInfoInterface
include "config.iol"

service Client {

    execution{ single }

    embed Console as Console

    outputPort GetInfo {
        Location: GetInfo_location
        Protocol: sodep
        Interfaces: GetInfoInterface
    }

    main {
        if ( #args == 0 ) {
            println@Console("Specify the city for which you are requiring information")()
        } else {
            request.city = args[0];
            getInfo@GetInfo( request )( response );
            println@Console("Temperature:" + response.temperature )();
            println@Console("Wind:" + response.wind )();
            println@Console("Traffic:" + response.traffic )()
        }
    }
}