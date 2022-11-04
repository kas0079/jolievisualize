package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class InputPort {
    public String name;
    public String protocol;
    public String location;
    public List<Aggregate> aggregates = new ArrayList<>();
    public List<String> interfaces = new ArrayList<>();
    public Map<String, String> redirects = new HashMap<>();
    public List<Courier> couriers = new ArrayList<>();

    public boolean samePort(InputPort port) {
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

        if (aggregates.size() > 0) {
            List<JSONObject> aggregateTmp = new ArrayList<>();
            for (Aggregate aggr : aggregates)
                aggregateTmp.add(aggr.toJSON());

            map.put("aggregates", aggregateTmp);
        }

        if (redirects.size() > 0) {
            List<JSONObject> redirectTmp = new ArrayList<>();
            redirects.forEach((name, port) -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", name);
                tmp.put("port", port);
                redirectTmp.add(new JSONObject(tmp));
            });
            map.put("redirects", redirectTmp);
        }

        if (couriers.size() > 0) {
            List<JSONObject> courierTmp = new ArrayList<>();
            for (Courier c : couriers)
                courierTmp.add(c.toJSON());
            map.put("couriers", courierTmp);
        }

        return new JSONObject(map);
    }
}
