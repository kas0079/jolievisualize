from .PrinterInterface import PrintRequest
from .FaxInterface import FaxRequest

type FaxAndPrintRequest: void {
    .fax: FaxRequest
    .print: PrintRequest
}

interface AggregatorInterface {
    RequestResponse:
        faxAndPrint(FaxAndPrintRequest)(void) throws Aborted
}
