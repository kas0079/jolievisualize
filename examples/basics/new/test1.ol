from .interfaceTest import testInterface
from .interface2 import testInterface as lol

type embedType: void {
    .id: int
}

interface embedInterface {
    RequestResponse: embedRR(string)(embedType)
    OneWay: embedOW(int)
}

service MainService {
    execution{ concurrent }

    embed test as Test
    outputPort MainTest {
        Location: "socket://localhost:5678"
        Protocol: sodep
        Interfaces: testInterface
    }

    inputPort IP {
        Location: "socket://localhost:3498"
        Protocol: sodep
        Interfaces: lol
    }
}

service test {
    outputPort TestPort {
        Location: "socket://localhost:9876"
        Protocol: sodep
        Interfaces: embedInterface
    }
}