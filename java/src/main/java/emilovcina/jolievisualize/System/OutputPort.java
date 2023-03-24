package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.CodeRange;
import jolie.lang.parse.ast.OneWayOperationDeclaration;
import jolie.lang.parse.ast.RequestResponseOperationDeclaration;

public class OutputPort {
    private String name;
    private String protocol;
    private String location;
    private List<CodeRange> codeRanges = new ArrayList<>();

    private Map<Long, String> interfaces = new HashMap<>();

    private List<OneWayOperationDeclaration> owOperations = new ArrayList<>();
    private List<RequestResponseOperationDeclaration> rrOperations = new ArrayList<>();

    private String annotation;

    public OutputPort(String name, String protocol, String location) {
        this.name = name;
        this.protocol = protocol;
        this.location = location;
    }

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("protocol", protocol);
        map.put("location", location);

        if (getAnnotation() != null && getAnnotation().length() > 0)
            map.put("annotation", getAnnotation());

        if (codeRanges.size() > 0) {
            List<JSONObject> codeRangeTmp = new ArrayList<>();
            codeRanges.forEach(cr -> {
                codeRangeTmp.add(cr.toJSON());
            });
            map.put("ranges", codeRangeTmp);
        }

        if (interfaces.size() > 0) {
            List<JSONObject> interfListTmp = new ArrayList<>();
            interfaces.forEach((id, name) -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", name);
                tmp.put("id", id);
                interfListTmp.add(new JSONObject(tmp));
            });
            map.put("interfaces", interfListTmp);
        }
        if (rrOperations.size() > 0) {
            List<JSONObject> rrTmp = new ArrayList<>();
            rrOperations.forEach(rr -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", rr.id());
                tmp.put("req", rr.requestType().name());
                tmp.put("res", rr.responseType().name());
                rrTmp.add(new JSONObject(tmp));
            });
            map.put("reqres", rrTmp);
        }
        if (owOperations.size() > 0) {
            List<JSONObject> owTmp = new ArrayList<>();
            owOperations.forEach(ow -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", ow.id());
                tmp.put("req", ow.requestType().name());
                owTmp.add(new JSONObject(tmp));
            });
            map.put("oneway", owTmp);
        }

        return new JSONObject(map);
    }

    /**
     * =============================================
     * LIST ADDERS:
     */
    public void addInterface(Interface interf) {
        interfaces.put(interf.getID(), interf.getName());
    }

    public void addCodeRange(CodeRange cr) {
        codeRanges.add(cr);
    }

    public void addOneWayOperation(OneWayOperationDeclaration ood) {
        this.owOperations.add(ood);
    }

    public void addReqResOpersation(RequestResponseOperationDeclaration rrd) {
        this.rrOperations.add(rrd);
    }

    /**
     * =============================================
     * GETTERS AND SETTERS:
     */
    public String getName() {
        return name;
    }

    public String getProtocol() {
        return protocol;
    }

    public String getLocation() {
        return location;
    }

    public Map<Long, String> getInterfaces() {
        return interfaces;
    }

    public List<CodeRange> getCodeRanges() {
        return codeRanges;
    }

    public List<RequestResponseOperationDeclaration> getRROperations() {
        return this.rrOperations;
    }

    public List<OneWayOperationDeclaration> getOWOperations() {
        return this.owOperations;
    }

    public String getAnnotation() {
        return annotation;
    }

    public void setAnnotation(String anno) {
        this.annotation = anno;
    }
}
