from .PrinterInterface import PrinterInterface
from .FaxInterface import FaxInterface
from .LoggerInterface import LoggerInterface
from .AggregatorInterface import AggregatorInterface
from console import Console
from string_utils import StringUtils

type AuthenticationData:void {
	.key:string
}
interface extender AuthenticationInterfaceExtender {
    RequestResponse:
        *(AuthenticationData)(void)
    OneWay:
        *(AuthenticationData)
}

service Aggregator {
    execution{ concurrent }

    embed Console as Console
    embed StringUtils as StringUtils

    outputPort Printer1 {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: PrinterInterface
    }

    outputPort Printer2 {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: PrinterInterface
    }

    outputPort Fax {
        Location: "socket://localhost:9002"
        Protocol: sodep
        Interfaces: FaxInterface
    }

    outputPort Logger {
        Location: "socket://localhost:9009"
        Protocol: sodep
        Interfaces: LoggerInterface
    }

    inputPort Aggregator {
        Location: "socket://localhost:9003"
        Protocol: sodep
        Interfaces: AggregatorInterface
        Aggregates: {Printer1, Printer2} with AuthenticationInterfaceExtender, Fax
    }

    courier Aggregator {
        [ interface PrinterInterface( request ) ] {
            /* depending on the key the message will be forwared to Printer1 or Printer2 */
            if ( request.key == "0000" ) {
                log@Logger( "Request for printer service 1" );
                forward Printer1( request )
            } else if ( request.key == "1111" ) {
                log@Logger( "Request for printer service 2" );
                forward Printer2( request )
            } else {
                /* in this case the message is discarded and a log is printed out on the console */
                log@Logger( "Request with invalid key: " + request.key )
            }
        }

        [ interface FaxInterface( request ) ] {
            /* in case of messages for service Fax, a log is printed out on the console and then forwarded */
            log@Logger( "Received a request for fax service" );
            forward ( request )
        }
    }

    init {
        println@Console( "Aggregator started" )()
    }

    main {
        get_key( username )( key ) {
            if ( username == "username1" ) {
                key = "0000"
            } else if ( username == "username2" ) {
                key = "1111"
            } else {
                key = "XXXX"
            };
            log@Logger( "Sending key for username " + username )
        }
    }
}