package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.parse.ast.OneWayOperationDeclaration;
import jolie.lang.parse.ast.RequestResponseOperationDeclaration;

public class Interface {
    public String name;
    public List<RequestResponseOperationDeclaration> reqres = new ArrayList<>();
    public List<OneWayOperationDeclaration> oneway = new ArrayList<>();

    public JSONObject toJSON() {
        Map<String, Object> obj = new HashMap<>();
        obj.put("name", name);

        if (reqres.size() > 0) {
            List<JSONObject> reqresList = new ArrayList<>();
            for (RequestResponseOperationDeclaration rr : reqres) {
                Map<String, Object> rrsObj = new HashMap<>();
                rrsObj.put("name", rr.id());
                rrsObj.put("req", rr.requestType().name());
                rrsObj.put("res", rr.responseType().name());
                reqresList.add(new JSONObject(rrsObj));
            }
            obj.put("reqres", reqresList);
        }

        if (oneway.size() > 0) {
            List<JSONObject> onewayList = new ArrayList<>();
            for (OneWayOperationDeclaration ow : oneway) {
                Map<String, Object> owsObj = new HashMap<>();
                owsObj.put("name", ow.id());
                owsObj.put("req", ow.requestType().name());
                onewayList.add(new JSONObject(owsObj));
            }
            obj.put("oneway", onewayList);
        }

        return new JSONObject(obj);
    }
}
