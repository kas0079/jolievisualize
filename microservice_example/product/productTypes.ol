type Product: void {
    id: int
    name: string
    producer: string
    price: double
}

type ErrorResponse: void {
    message: string
    error: bool
    code: int
}

type CreateProductRequest: void {
    product: Product
    userID: int
}

type UpdateProductRequest: void {
    product: Product
    userID: int
}

type DeleteProductRequest: void {
    productID: int
    userID: int
}

type ReadProductRequest: int