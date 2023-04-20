from .paymentTypes import PaymentRequest, PaymentResponse

interface PaymentIFace {
    RequestResponse:
        processPayment(PaymentRequest)(PaymentResponse)
}