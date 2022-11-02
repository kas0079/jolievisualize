from .powerInterface import serviceInterface
from console import Console


service Client {

    outputPort ServerOutput {
        Location: "socket://localhost:9876"
        Protocol: sodep
        Interfaces: serviceInterface
    }

    embed Console as Console

    main {
        if( #args == 0) {
            println@Console("No input given")()
        } else {
            request = int(args[0])
            twopow@ServerOutput(request)(response)
            println@Console(request + " to the power of two is: " + response)()
        }
    }
}