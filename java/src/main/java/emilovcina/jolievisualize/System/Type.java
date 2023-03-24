package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Type {
    private String name;
    private String type;
    private List<Type> subtypes = new ArrayList<>();

    private String leftType;
    private String rightType;

    private String uri;

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof Type))
            return false;
        Type other = (Type) o;
        return this.toJSON().equals(other.toJSON());
    }

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        if (type != null && !type.equals("void"))
            map.put("type", type);
        if (leftType != null && !leftType.equals("void"))
            map.put("leftType", leftType);
        if (rightType != null && !rightType.equals("void"))
            map.put("rightType", rightType);

        if (uri != null && uri.length() > 0)
            map.put("file", uri);

        if (subtypes.size() > 0) {
            List<JSONObject> subtypesTmp = new ArrayList<>();
            subtypes.forEach((type) -> {
                subtypesTmp.add(type.toJSON());
            });
            map.put("subTypes", subtypesTmp);
        }

        return new JSONObject(map);
    }

    /**
     * =============================================
     * LIST ADDERS:
     */
    public void addSubType(Type type) {
        subtypes.add(type);
    }

    /**
     * =============================================
     * GETTERS AND SETTERS:
     */
    public void setLeftType(String left) {
        this.leftType = left;
    }

    public void setRightType(String right) {
        this.rightType = right;
    }

    public String getUri() {
        return this.uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String name) {
        this.type = name;
    }
}