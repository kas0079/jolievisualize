from ..product.productTypes import Product

type RecommendationRequest: void {
    userID: int
}

type RecommendationResponse: void {
    products[0, *]: Product
}