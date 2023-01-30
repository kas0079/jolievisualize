package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import joliex.jolievisualize.CodeRange;

public class OutputPort {
    private String name;
    private String protocol;
    private String location;
    private List<CodeRange> codeRanges = new ArrayList<>();

    private Map<Long, String> interfaces = new HashMap<>();

    public OutputPort(String name, String protocol, String location) {
        this.name = name;
        this.protocol = protocol;
        this.location = location;
    }

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

    public void addInterface(Interface interf) {
        interfaces.put(interf.getID(), interf.getName());
    }

    public void addCodeRange(CodeRange cr) {
        codeRanges.add(cr);
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("protocol", protocol);
        map.put("location", location);

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

        return new JSONObject(map);
    }
}
