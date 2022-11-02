from .powerInterface import serviceInterface

type MyParams {
    test: void {
        loc: string
    }
}

service Server(p: MyParams) {
    execution{ concurrent }

    inputPort ServerInput {
        Location: p.test.loc
        Protocol: sodep
        Interfaces: serviceInterface
    }

    main {
        [ twopow(request)(response) {
            response = request * request
        } ]
    }
}