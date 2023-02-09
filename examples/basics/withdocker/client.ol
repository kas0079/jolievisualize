from .intface import dummy as test

service Client {

    outputPort Server {
        Location: "socket://localhost:9000"
        Protocol: sodep
        Interfaces: test
    }

}