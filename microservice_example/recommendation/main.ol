from .recommendationInterface import RecommendationIFace

service Recommendation {

    execution{ concurrent }

    inputPort IP {
        Location: "socket://localhost:7788"
        Protocol: sodep
        Interfaces: RecommendationIFace
    }

    main
    {
        [ getRecommendation(req)(res) {
           nullProcess
        } ]
    }
}