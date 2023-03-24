from .SumInterface import SumInterface

service Sum {

    execution{ concurrent }

    inputPort Sum {
        Location: "socket://localhost:9002"
        Protocol: sodep
        Interfaces: SumInterface
    }

    main {
        sum(req)(res) {
            res = req.x + req.y
        }
    }
}