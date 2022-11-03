from ...FaxInterface import FaxInterface
from console import Console

service Test {
    execution{ concurrent }

    embed Console as Console

    inputPort FaxInput {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: FaxInterface
    }

    main {
        fax( request )() {
			println@Console( "Faxing2 to " + request.destination + ". Content: " + request.content )()
	    }
    }
}