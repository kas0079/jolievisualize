package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import joliex.jolievisualize.PlaceGraph.PlaceGraph;

public class JolieSystem {
    private long highestID = -1;
    public String name;
    public List<Service> topLevelServices = new ArrayList<>();
    public List<Service> listOfServices = new ArrayList<>();
    public List<Interface> listOfInterfaces = new ArrayList<>();
    public List<Type> listOfTypes = new ArrayList<>();
    public PlaceGraph placeGraph = new PlaceGraph();

    public long getNextID() {
        return ++highestID;
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        // Services array
        List<JSONObject> serviceListTmp = new ArrayList<>();
        for (Service s : listOfServices)
            serviceListTmp.add(s.toJSON());

        // Interface array
        List<JSONObject> interfaceListTmp = new ArrayList<>();
        for (Interface i : listOfInterfaces)
            interfaceListTmp.add(i.toJSON());

        // Types
        List<JSONObject> typeListTmp = new ArrayList<>();
        for (Type t : listOfTypes)
            typeListTmp.add(t.toJSON());

        map.put("name", name);
        map.put("services", serviceListTmp);
        map.put("interfaces", interfaceListTmp);
        map.put("types", typeListTmp);
        // TODO change to array if more than one network exists on the top level
        map.put("placegraph", placeGraph.toJSON());
        return new JSONObject(map);
    }
}
