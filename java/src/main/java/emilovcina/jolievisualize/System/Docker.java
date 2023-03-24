package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Docker extends Service {

    public Docker(long id) {
        super(id);
    }

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    @Override
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", getName());
        map.put("image", getImage());
        map.put("id", getId());

        if (getPorts().size() > 0) {
            List<JSONObject> portTmp = new ArrayList<>();
            getPorts().forEach((i, o) -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("iport", i);
                tmp.put("eport", o);
                portTmp.add(new JSONObject(tmp));
            });
            map.put("ports", portTmp);
        }

        if (getContainerName() != null)
            map.put("container", getContainerName());

        return new JSONObject(map);
    }
}
