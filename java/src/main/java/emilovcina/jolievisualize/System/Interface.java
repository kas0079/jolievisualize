package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.parse.ast.OneWayOperationDeclaration;
import jolie.lang.parse.ast.RequestResponseOperationDeclaration;
import jolie.util.Pair;

public class Interface {
    private String name;
    private long id;
    private Map<RequestResponseOperationDeclaration, Pair<String, String>> reqres = new HashMap<>();
    private Map<OneWayOperationDeclaration, String> oneway = new HashMap<>();
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

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    public JSONObject toJSON() {
        Map<String, Object> obj = new HashMap<>();
        obj.put("name", name);
        obj.put("id", id);

        if (uri != null && uri.length() > 0)
            obj.put("file", uri);

        if (reqres.size() > 0) {
            List<JSONObject> reqresList = new ArrayList<>();
            for (RequestResponseOperationDeclaration rr : reqres.keySet()) {
                Map<String, Object> rrsObj = new HashMap<>();
                rrsObj.put("name", rr.id());
                Map<String, Object> reqType = new HashMap<>();
                Map<String, Object> resType = new HashMap<>();
                reqType.put("name", rr.requestType().name());
                reqType.put("file", reqres.get(rr).key());
                resType.put("name", rr.responseType().name());
                resType.put("file", reqres.get(rr).value());
                rrsObj.put("req", new JSONObject(reqType));
                rrsObj.put("res", new JSONObject(resType));
                reqresList.add(new JSONObject(rrsObj));
            }
            obj.put("reqres", reqresList);
        }

        if (oneway.size() > 0) {
            List<JSONObject> onewayList = new ArrayList<>();
            for (OneWayOperationDeclaration ow : oneway.keySet()) {
                Map<String, Object> owsObj = new HashMap<>();
                owsObj.put("name", ow.id());
                Map<String, Object> reqType = new HashMap<>();
                reqType.put("name", ow.requestType().name());
                reqType.put("file", oneway.get(ow));
                owsObj.put("req", new JSONObject(reqType));
                onewayList.add(new JSONObject(owsObj));
            }
            obj.put("oneway", onewayList);
        }

        return new JSONObject(obj);
    }

    /**
     * =============================================
     * LIST ADDERS:
     */
    public void addRequestResponse(RequestResponseOperationDeclaration rrod, Pair<String, String> filePair) {
        reqres.put(rrod, filePair);
    }

    public void addOneWay(OneWayOperationDeclaration ood, String file) {
        oneway.put(ood, file);
    }

    /**
     * =============================================
     * GETTERS AND SETTERS:
     */
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

    public Map<RequestResponseOperationDeclaration, Pair<String, String>> getRROperations() {
        return this.reqres;
    }

    public Map<OneWayOperationDeclaration, String> getOWOperations() {
        return this.oneway;
    }
}
