package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Aggregate {
    public String name;
    public List<String> collection = new ArrayList<>();
    public Interface extender;

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);

        if (collection.size() > 0) {
            List<JSONObject> collTmp = new ArrayList<>();
            for (String s : collection) {
                Map<String, Object> cTmp = new HashMap<>();
                cTmp.put("name", s);
                collTmp.add(new JSONObject(cTmp));
            }
            map.put("collection", collTmp);
        }

        if (extender != null) {
            map.put("extender", extender.toJSON());
        }

        return new JSONObject(map);
    }
}
