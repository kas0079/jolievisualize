type params: void {
    location: string
}

service TestService(p: params) {
    inputPort PortName {
        Location: p.params.location
        Protocol: sodep
        OneWay: hi(void)
    }
}