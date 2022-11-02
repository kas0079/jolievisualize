from .FaxInterface import FaxInterface
from .PrinterInterface import PrinterInterface
from .AggregatorInterface import AggregatorInterface
from .ExtendedPrinterInterface import ExtendedPrinterInterface
from console import Console

service Client {

    embed Console as Console

    outputPort Aggregator {
        Location: "socket://localhost:9003"
        Protocol: sodep
        Interfaces: ExtendedPrinterInterface, FaxInterface
    }

    main {
        request.content = "Hello, Printer!";

        get_key@Aggregator( "username1" )( request.key );
        request.job = 1;
        print@Aggregator( request );

        get_key@Aggregator( "username2" )( request.key );
        request.job = 2;
        print@Aggregator( request );

        request.key = "Invalid";
        request.job = 3;
        print@Aggregator( request );

        faxRequest.destination = "123456789";
        faxRequest.content = "Hello, Fax!";
        fax@Aggregator( faxRequest )
    }
}