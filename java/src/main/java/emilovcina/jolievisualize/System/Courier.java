package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Courier {

    private String name;
    private List<String> interfaceOneWay = new ArrayList<>();
    private List<String> interfaceReqRes = new ArrayList<>();
    private List<String> operationOneWay = new ArrayList<>();
    private List<String> operationReqRes = new ArrayList<>();

    public Courier(String name) {
        this.name = name;
    }

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);

        if (interfaceOneWay.size() > 0) {
            List<JSONObject> iooTmp = new ArrayList<>();
            for (String s : interfaceOneWay) {
                Map<String, Object> _t = new HashMap<>();
                _t.put("name", s);
                iooTmp.add(new JSONObject(_t));
            }
            map.put("interfaceOneWay", iooTmp);
        }

        if (interfaceReqRes.size() > 0) {
            List<JSONObject> irrTmp = new ArrayList<>();
            for (String s : interfaceReqRes) {
                Map<String, Object> _t = new HashMap<>();
                _t.put("name", s);
                irrTmp.add(new JSONObject(_t));
            }
            map.put("interfaceReqRes", irrTmp);
        }

        if (operationOneWay.size() > 0) {
            List<JSONObject> iooTmp = new ArrayList<>();
            for (String s : operationOneWay) {
                Map<String, Object> _t = new HashMap<>();
                _t.put("name", s);
                iooTmp.add(new JSONObject(_t));
            }
            map.put("operationOneWay", iooTmp);
        }

        if (operationReqRes.size() > 0) {
            List<JSONObject> irrTmp = new ArrayList<>();
            for (String s : operationReqRes) {
                Map<String, Object> _t = new HashMap<>();
                _t.put("name", s);
                irrTmp.add(new JSONObject(_t));
            }
            map.put("operationReqRes", irrTmp);
        }

        return new JSONObject(map);
    }

    /**
     * =============================================
     * LIST ADDERS:
     */
    public void addInterfaceOneWay(String op) {
        interfaceOneWay.add(op);
    }

    public void addInterfaceReqRes(String op) {
        interfaceReqRes.add(op);
    }

    public void addOperationOneWay(String op) {
        operationOneWay.add(op);
    }

    public void addOperationReqRes(String op) {
        operationReqRes.add(op);
    }

    /**
     * =============================================
     * GETTERS AND SETTERS:
     */
    public String getName() {
        return this.name;
    }
}
