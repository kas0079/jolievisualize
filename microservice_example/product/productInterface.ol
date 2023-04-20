from .productTypes import CreateProductRequest, ErrorResponse, ReadProductRequest, Product, UpdateProductRequest, DeleteProductRequest

interface ProductIFace{
    RequestResponse:
        createProduct(CreateProductRequest)(ErrorResponse),
        readProduct(ReadProductRequest)(Product),
        updateProduct(UpdateProductRequest)(ErrorResponse),
        deleteProduct(DeleteProductRequest)(ErrorResponse)
}