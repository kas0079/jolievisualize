package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Type {
    public String name;
    public String type;
    public List<Type> subtypes = new ArrayList<>();

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        if (!type.equals("void"))
            map.put("type", type);

        if (subtypes.size() > 0) {
            List<JSONObject> subtypesTmp = new ArrayList<>();
            subtypes.forEach((type) -> {
                subtypesTmp.add(type.toJSON());
            });
            map.put("subTypes", subtypesTmp);
        }

        return new JSONObject(map);
    }
}
