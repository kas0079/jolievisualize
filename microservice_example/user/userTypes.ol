type RegisterRequest: void {
    email: string
    password: string
    pass2: string
}

type LoginRequest: void {
    email: string
    password: string
}

type LoginResponse: void {
    error: bool
    message: bool
    code: int
    auth_token?: string
}

type UpdateRequest: void {
    newName?: string
    newPassword?: string
    newDOB?: string
}

type ErrorResponse: void {
    error: bool
    message: string
    code: int
}

type DeleteRequest: void {
    userID: int
}