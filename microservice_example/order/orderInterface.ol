from .orderTypes import Order, PlaceOrderResponse, OrderRequest, CancelOrderResponse, PlaceOrderRequest

interface OrderIFace {
    RequestResponse:
        placeOrder(PlaceOrderRequest)(PlaceOrderResponse),
        getOrder(OrderRequest)(Order),
        cancelOrder(OrderRequest)(CancelOrderResponse)
}