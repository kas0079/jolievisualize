from .s2 import ServiceTwo

service ServiceOne {
    embed ServiceTwo as STwo
}