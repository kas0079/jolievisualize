from console import Console
from .LoggerInterface import LoggerInterface

service Logger {

    execution{ concurrent }

    embed Console as Console

    inputPort Logger {
        Location: "socket://localhost:9009"
        Protocol: sodep
        Interfaces: LoggerInterface
    }

    init {
        enableTimestamp@Console(true)()
    }

    main {
        log(request);
        println@Console(request.content)()
    }
}