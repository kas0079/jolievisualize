from console import Console

type myParams {
    text: string
}

service EmbeddedService(p: myParams) {

    embed Console as Console

    main {
        println@Console(p.text)()
    }
}