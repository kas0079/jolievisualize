from .intface import dummy

service Server {

    execution{concurrent}

    inputPort Input {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: dummy
    }

    outputPort ToDB {
        Location: "socket://localhost:5432"
        Protocol: sodep
    }

    main {
         [ hi(req) ] {
            shutdown()
         }
    }
}