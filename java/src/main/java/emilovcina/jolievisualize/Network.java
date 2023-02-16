package emilovcina.jolievisualize;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.System.Service;
import jolie.lang.parse.ast.ServiceNode;
import jolie.util.Pair;

public class Network {
    private Map<TopLevelDeploy, Pair<ServiceNode, JSONObject>> network = new HashMap<>();

    private List<Service> listOfServices = new ArrayList<>();

    public void addService(Service s) {
        listOfServices.add(s);
    }

    public List<Service> getServices() {
        return listOfServices;
    }

    public void addNetwork(TopLevelDeploy tld, ServiceNode n, JSONObject params) {
        network.put(tld, new Pair<ServiceNode, JSONObject>(n, params));
    }

    public Map<TopLevelDeploy, Pair<ServiceNode, JSONObject>> getNetwork() {
        return network;
    }
}
