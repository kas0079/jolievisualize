from ..product.productTypes import Product
from ..payment.paymentTypes import PaymentRequest

type Order: void {
    id: int
    products[0, *]: Product
    tax: double
    coupon: string
    total: double
    status: string
}

type PlaceOrderRequest: void {
    products[0, *]: Product
    payment: PaymentRequest
    userID: int
}

type PlaceOrderResponse: void {
    error: bool
    message: string
    code: int
}

type CancelOrderResponse: void {
    error: bool
    message: string
    code: int
}

type OrderRequest: void {
    orderID: int
}

