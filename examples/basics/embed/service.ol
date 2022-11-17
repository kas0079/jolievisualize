from .s1 import S1
from .s2 import S2

interface test {
    RequestResponse:
        test(int) (int)
}

service MyService {
    embed S1 as p1

    outputPort PortName {
        Location: "socket://localhost:9100"
        Protocol: sodep
        Interfaces: test
    }
    
    embed S2 in PortName
}