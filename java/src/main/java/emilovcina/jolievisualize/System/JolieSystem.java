package emilovcina.jolievisualize.System;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class JolieSystem {
    private long highestID = -1;
    private long highestInterfaceID = -1;
    private String name;
    private Path visFilePath;
    private List<Interface> listOfInterfaces = new ArrayList<>();
    private List<Type> listOfTypes = new ArrayList<>();
    private List<Network> networks;

    public JolieSystem(List<Network> networks, Path visFile) {
        this.networks = networks;
        this.visFilePath = visFile;
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);

        List<List<JSONObject>> networkListtmp = new ArrayList<>();
        for (Network n : networks) {
            List<JSONObject> serviceListTmp = new ArrayList<>();
            for (Service s : n.getServices())
                serviceListTmp.add(s.toJSON());
            networkListtmp.add(serviceListTmp);
        }
        map.put("services", networkListtmp);

        List<JSONObject> interfaceListtmp = new ArrayList<>();
        for (Interface f : listOfInterfaces)
            interfaceListtmp.add(f.toJSON());
        map.put("interfaces", interfaceListtmp);

        List<JSONObject> typeListTmp = new ArrayList<>();
        for (Type t : listOfTypes)
            typeListTmp.add(t.toJSON());
        map.put("types", typeListTmp);

        return new JSONObject(map);
    }

    public Type addTypeIfUnique(Type type) {
        for (int i = 0; i < listOfTypes.size(); i++)
            if (listOfTypes.get(i).equals(type))
                return listOfTypes.get(i);
        listOfTypes.add(type);
        return type;
    }

    public Interface addInterfaceIfUnique(Interface inter) {
        for (int i = 0; i < listOfInterfaces.size(); i++)
            if (listOfInterfaces.get(i).equals(inter)) {
                highestInterfaceID--;
                return listOfInterfaces.get(i);
            }
        listOfInterfaces.add(inter);
        return inter;
    }

    public long getNextInterfaceID() {
        return ++highestInterfaceID;
    }

    public long getNextID() {
        return ++highestID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Path getVisFilePath() {
        return this.visFilePath;
    }

    public List<Network> getNetworks() {
        return networks;
    }

    public List<Interface> getInterfaces() {
        return this.listOfInterfaces;
    }
}
