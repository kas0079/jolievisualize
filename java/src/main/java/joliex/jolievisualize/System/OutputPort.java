package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.parse.ast.InterfaceDefinition;

public class OutputPort {
    public String name;
    public String protocol;
    public String location;
    public List<InterfaceDefinition> interfaces = new ArrayList<>();

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("protocol", protocol);
        map.put("location", location);

        if (interfaces.size() > 0) {
            List<JSONObject> interfaceList = new ArrayList<>();
            for (InterfaceDefinition id : interfaces) {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", id.name());
                interfaceList.add(new JSONObject(tmp));
            }
            map.put("interfaces", interfaceList);
        }

        return new JSONObject(map);
    }
}
