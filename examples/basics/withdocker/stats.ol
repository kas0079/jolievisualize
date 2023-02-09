interface fromDB {
    OneWay:
        SaveStuff(string)
}

service Stats {
    inputPort PortName {
        Location: "socket://localhost:3434"
        Protocol: sodep
        Interfaces: fromDB
    }

    main {
        [ SaveStuff(req) ] {
            shutdown()
        }
    }
}