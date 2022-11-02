from .FaxInterface import FaxInterface
from console import Console

service Fax {
    execution{ concurrent }

    embed Console as Console

    inputPort FaxInput {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: FaxInterface
    }

    main {
        fax( request )() {
			println@Console( "Faxing to " + request.destination + ". Content: " + request.content )()
	    }
    }
}