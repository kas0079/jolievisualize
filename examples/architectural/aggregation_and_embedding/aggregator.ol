from .printer import Printer
from .fax import Fax
from .AggregatorInterface import AggregatorInterface
from .PrinterInterface import PrinterInterface
from .FaxInterface import FaxInterface
from console import Console

service Aggregator {

    execution{ concurrent }

    embed Console as Console

    outputPort printer {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: PrinterInterface
    }

    outputPort Fax {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: FaxInterface
    }

    embed Fax in Fax
    embed Printer in printer

    inputPort Aggregator {
        Location: "socket://localhost:9002"
        Protocol: sodep
        Interfaces: AggregatorInterface
        Aggregates: printer, Fax
    }

     init {
        println@Console("Aggregator started")();
        install(Aborted => nullProcess)
    }

    main {
        /* this is the implementation of the operation declared in interface AggregatorInterface.
        the operation implements a composed invocation of the operations of Printer and Fax
        */
        faxAndPrint( request )( response ) {
        scope( fax_and_print ) {
                install( IOException => comp( print ); throw( Aborted ) );
                {
                    scope( fax ) {
                        println@Console("Faxing document to " + request.fax.destination )();
                        fax@Fax( request.fax )()
                    }
                    |
                    scope( print ) {
                        println@Console("Printing document " + request.print.content )();
                        print@printer( request.print )( del_request )
                        [
                            /* termination handler installed after the request message is sent */
                            this => del@Printer( del_request );
                            println@Console("Rolling back printing..." )();
                            println@Console("Deleted job " + del_request.jobId )()
                        ]
                    }
                }
            }
        }
    }
}