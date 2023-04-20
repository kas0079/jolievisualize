from .recommendationTypes import RecommendationRequest, RecommendationResponse

interface RecommendationIFace {
    RequestResponse:
    getRecommendation(RecommendationRequest)(RecommendationResponse)
}