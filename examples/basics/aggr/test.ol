interface realInterface1 {
    OneWay:
        realOp1(int)
}

interface realInterface2 {
    OneWay:
        realOp2(int)
}

service Aggregator {

    execution{ concurrent }

    outputPort S1Port {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: realInterface1
    }

    outputPort S2Port {
        Location: "socket://localhost:9002"
        Protocol: sodep
        Interfaces: realInterface2
    }

    ///@jolievisualize aggregator
    inputPort RealPort {
        Location: "socket://localhost:9000"
        Protocol: sodep
        aggregates: S1Port, S2Port
    }

    ///@jolievisualize dummy
    inputPort dummy {
        Location: "local"
        Protocol: sodep
        OneWay: dummy(void)
    }

    main {
         [dummy()]{
            shutdown()
         }
    }
}