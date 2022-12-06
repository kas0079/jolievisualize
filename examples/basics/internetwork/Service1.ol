interface service2Inter {
    RequestResponse:
        test(int)(int)
}

service One {
    outputPort Output {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: service2Inter
    }
}