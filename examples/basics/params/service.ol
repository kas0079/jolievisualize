from console import Console

type MyServiceParam {
    factor: int
    prot: string
    location: string
}

interface MyServiceInterface {
    RequestResponse: multiply ( int )( int )
}

service MyService( p: MyServiceParam ) {

    embed Console as Console

    execution: concurrent

    inputPort IP {
        location: p.location
        protocol: p.prot
        interfaces: MyServiceInterface
    }

    main {
        multiply ( number )( result ) {
            result = number * p.factor
        }
    }
}