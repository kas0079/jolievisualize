
interface dummy {
    RequestResponse:
        hello(int)(int)
}

service ServiceTwo {
    inputPort Internal {
        Location: "local"
        Protocol: sodep
        Interfaces: dummy
    }
}