type testType: void {
    .what: int
    .the: string
}

interface testInterface {
    RequestResponse:
    hello(testType)(int)
}