interface service1Inter {
    RequestResponse:
        test(int)(int)
}

service Two {
    inputPort Input {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: service1Inter
    }
}