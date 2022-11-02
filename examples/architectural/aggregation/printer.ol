from .PrinterInterface import PrinterInterface
from console import Console

service Printer {

    execution{ concurrent }

    embed Console as Console

    inputPort PrinterInput {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: PrinterInterface
    }

    main {
        [ print( request )( response ) {
            jobId = new;
            println@Console( "Printing job id: " + jobId + ". Content: " + request.content )();
            response.jobId = jobId
        }]

        [ del( request ) ] {
            println@Console( "Deleting job id: " + request.jobId )()
        }
    }
}