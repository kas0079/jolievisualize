package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import emilovcina.jolievisualize.TopLevelDeploy;
import jolie.lang.parse.ast.ServiceNode;

public class Network {
    private Map<TopLevelDeploy, ServiceNode> network = new HashMap<>();

    private List<Service> listOfServices = new ArrayList<>();

    public void addService(Service s) {
        listOfServices.add(s);
    }

    public void addNetwork(TopLevelDeploy tld, ServiceNode n) {
        network.put(tld, n);
    }

    public List<Service> getServices() {
        return listOfServices;
    }

    public Map<TopLevelDeploy, ServiceNode> getNetwork() {
        return network;
    }
}
