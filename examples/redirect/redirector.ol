from .SubInterface import SubInterface
from .SumInterface import SumInterface
from console import Console

service Redirector {

    execution{ single }

    embed Console as Console

    outputPort SubService {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: SubInterface
    }

    outputPort SumService {
        Location: "socket://localhost:9002"
        Protocol: sodep
        Interfaces: SumInterface
    }

    inputPort Redirector {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Redirects: Sub => SubService, Sum => SumService
    }

    main {
    /* internal link just used for keeping the redirector running */
        println@Console("Make the execution concurrent to make the example work")()
    }
}