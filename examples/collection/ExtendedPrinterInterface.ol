type PrintRequest_Auth:void {
	.job:int
	.content:string
	.key:string
}

type DelRequest_Auth:int {
	.key:string
}

interface ExtendedPrinterInterface {
    OneWay:
        print(PrintRequest_Auth),
        del(DelRequest_Auth)
    RequestResponse:
        get_key(string)(string)
}
