from .interfaces.infoInterface import GetInfoInterface
from .interfaces.forecastInterface import ForecastInterface
from .interfaces.trafficInterface import TrafficInterface
from console import Console
include "config.iol"

service Info {

    execution{ concurrent }

    embed Console as Console

    outputPort Forecast {
        Location: Forecast_location
        Protocol: sodep
        Interfaces: ForecastInterface
    }

    outputPort Traffic {
        Location: Traffic_location
        Protocol: sodep
        Interfaces: TrafficInterface
    }

    inputPort MySelf {
        Location: GetInfo_location
        Protocol: sodep
        Interfaces: GetInfoInterface
    }

    /* this is the orchestrator which receives the message from the client and call the three child microservices
   for retrieving the requested information */
    main {
        getInfo(request)(response) {
            getTemperature@Forecast( request )( response.temperature )
            ;
            getWind@Forecast( request )( response.wind )
            ;
            getData@Traffic( request )( response.traffic )
        };
        println@Console("Request served!")()
    }
}