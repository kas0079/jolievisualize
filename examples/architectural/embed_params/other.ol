from console import Console
from .embedded import EmbeddedService

service Other {

    embed Console as Console
    embed EmbeddedService({.text = "other!"}) as EmbSvc2

    main {
        println@Console("hello")()
    }
}