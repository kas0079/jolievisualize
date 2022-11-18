package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class OutputPort {
    private String name;
    private String protocol;
    private String location;

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

    public void addInterface(Interface interf) {
        interfaces.put(interf.getID(), interf.getName());
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("protocol", protocol);
        map.put("location", location);

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
