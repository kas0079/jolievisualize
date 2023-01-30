from Console import Console

interface dummy {
    OneWay: test(int)
}

service Aggr {
    execution{ concurrent }

    embed Console as Console

    ///@jolievisualize aggregator
    inputPort PortName {
        Location: "socket://localhost:3999"
        Protocol: http { .method = "get" }
        Interfaces: dummy
    }

    main {
        [shutdown()()] {
            exit
        }
    }
}
