from .SubInterface import SubInterface

service Sub {

    execution{ concurrent }

    inputPort Sub {
        Location: "socket://localhost:9001"
        Protocol: sodep
        Interfaces: SubInterface
    }

    main {
        sub(req)(res) {
            res = req.x - req.y
        }
    }
}