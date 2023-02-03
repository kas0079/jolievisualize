interface dummy {
    OneWay: hi(int)
}

service S1 {
    embed S2 as S2
}

service S2 {
    inputPort Test {
        Location: "local"
        Protocol: sodep
        Interfaces: dummy
    }
}