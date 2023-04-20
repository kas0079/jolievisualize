
type PaymentRequest: void {
    userID: int
    method: string
    amount: double
    cardInfo?: void {
        cardNumber: string
        date: string
        CVV: int
    }
}

type PaymentResponse: void {
    error: bool
    date: string
    receipt?: string
}