package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class OutputPort {
    public String name;
    public String protocol;
    public String location;
    public List<String> interfaces = new ArrayList<>();

    public boolean samePort(OutputPort port) {
        boolean intf = interfaces.size() == port.interfaces.size();
        for (int i = 0; i < interfaces.size() && intf; i++) {
            String i1 = interfaces.get(i);
            String i2 = port.interfaces.get(i);
            intf = i1.equals(i2);
        }
        return intf && port.name.equals(this.name) && port.protocol.equals(this.protocol)
                && port.location.equals(this.location);
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("protocol", protocol);
        map.put("location", location);

        if (interfaces.size() > 0) {
            List<JSONObject> interfaceList = new ArrayList<>();
            for (String id : interfaces) {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", id);
                interfaceList.add(new JSONObject(tmp));
            }
            map.put("interfaces", interfaceList);
        }

        return new JSONObject(map);
    }
}
