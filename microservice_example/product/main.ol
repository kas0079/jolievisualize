from .productInterface import ProductIFace
from ..analytics.analyticsInterface import AnalyticsIFace

service Product {

    execution{ concurrent }

    inputPort IP {
        Location: "socket://localhost:7777"
        Protocol: sodep
        Interfaces: ProductInterface
    }

    outputPort Analytics {
		Location: "socket://localhost:5554"
		Protocol: sodep
		Interfaces: AnalyticsIFace
	}

    main
    {
        [ createProduct ( req )( res ) {
            res.error = false
            res.message = ""
            res.code = 200;
            addToLogs@Analytics({
                fromService = "product"
                entry = "User " + req.userID + " created product " + req.product.name
            })
        } ]

        [ updateProduct ( req )( res ) {
            res.error = false
            res.message = ""
            res.code = 200;
            addToLogs@Analytics({
                fromService = "product"
                entry = "User " + req.userID + " updated product " + req.product.name
            })
        } ]

        [ readProduct ( req )( res ) {
            res.id = 0
            res.name = "Table"
            res.producer = "TableMakers Inc."
            res.price = 234
        } ]

        [ deleteProduct ( req )( res ) {
            res.error = false
            res.message = ""
            res.code = 200;
            addToLogs@Analytics({
                fromService = "product"
                entry = "User " + req.userID + " deleted product " + req.productID
            })
        } ]
    }
}