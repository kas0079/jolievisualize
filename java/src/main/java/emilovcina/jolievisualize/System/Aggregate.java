package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Aggregate {

    private String name;
    private List<String> collection = new ArrayList<>();
    private Interface extender;

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
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

    /**
     * =============================================
     * LIST ADDERS:
     */
    public void addCollection(String s) {
        collection.add(s);
    }

    /**
     * =============================================
     * GETTERS AND SETTERS:
     */
    public void setName(String name) {
        this.name = name;
    }

    public void setInterfaceExtension(Interface inter) {
        this.extender = inter;
    }
}
