from .userTypes import RegisterRequest, ErrorResponse, LoginRequest, LoginResponse, UpdateRequest, DeleteRequest

interface UserIFace {
    RequestResponse:
        register(RegisterRequest)(ErrorResponse),
        login(LoginRequest)(LoginResponse),
        updateUser(UpdateRequest)(ErrorResponse),
        deleteUser(DeleteRequest)(ErrorResponse)
}