package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Type {
    private String name;
    private String type;
    private List<Type> subtypes = new ArrayList<>();

    public Type(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof Type))
            return false;
        Type other = (Type) o;
        return this.toJSON().equals(other.toJSON());
    }

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

    public String getName() {
        return this.name;
    }

    public void addSubType(Type type) {
        subtypes.add(type);
    }

    public void setTypeName(String name) {
        this.type = name;
    }
}
