package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.parse.ast.OneWayOperationDeclaration;
import jolie.lang.parse.ast.RequestResponseOperationDeclaration;

public class Interface {
    private String name;
    private long id;
    private List<RequestResponseOperationDeclaration> reqres = new ArrayList<>();
    private List<OneWayOperationDeclaration> oneway = new ArrayList<>();

    private String uri;

    public Interface(long id, String name) {
        this.name = name;
        this.id = id;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this)
            return true;
        if (!(other instanceof Interface))
            return false;
        long oldID = this.id;
        Interface otherI = (Interface) other;
        this.id = otherI.getID();
        boolean res = this.toJSON().equals(otherI.toJSON());
        this.id = oldID;
        return res;
    }

    public JSONObject toJSON() {
        Map<String, Object> obj = new HashMap<>();
        obj.put("name", name);
        obj.put("id", id);

        if (uri != null && uri.length() > 0)
            obj.put("file", uri);

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

    public void addRequestResponse(RequestResponseOperationDeclaration rrod) {
        reqres.add(rrod);
    }

    public void addOneWay(OneWayOperationDeclaration ood) {
        oneway.add(ood);
    }

    public long getID() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getUri() {
        return this.uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public List<RequestResponseOperationDeclaration> getRROperations() {
        return this.reqres;
    }

    public List<OneWayOperationDeclaration> getOWOperations() {
        return this.oneway;
    }
}
