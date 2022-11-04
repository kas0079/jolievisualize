from console import Console
from .embedded import EmbeddedService

service Service {

    embed Console as Console
    embed EmbeddedService({.text = "world!"}) as EmbSvc

    main {
        println@Console("hello")()
    }
}