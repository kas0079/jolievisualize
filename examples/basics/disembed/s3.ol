from .s2 import ServiceTwo

service ServiceThree {
    embed ServiceTwo as S2
}