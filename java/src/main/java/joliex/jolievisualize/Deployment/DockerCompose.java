package joliex.jolievisualize.Deployment;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import joliex.jolievisualize.Network;
import joliex.jolievisualize.System.Docker;
import joliex.jolievisualize.System.InputPort;
import joliex.jolievisualize.System.JolieSystem;
import joliex.jolievisualize.System.Service;

public class DockerCompose {

    private final JolieSystem system;

    public DockerCompose(JolieSystem system) {
        this.system = system;
    }

    public String generateComposeFile() {
        StringBuilder str = new StringBuilder();
        str.append(genServices());
        str.append(genNetworks());
        return str.toString();
    }

    private String genServices() {
        StringBuilder svcs = new StringBuilder("services:\n");
        for (int i = 0; i < system.getNetworks().size(); i++) {
            Map<String, Integer> replicaMap = new HashMap<>();
            for (int j = 0; j < system.getNetworks().get(i).getServices().size(); j++) {
                Service svc = system.getNetworks().get(i).getServices().get(j);
                String svcName = svc.getName() + svc.getUri();
                if (replicaMap.containsKey(svcName)) {
                    replicaMap.put(svcName, replicaMap.get(svcName) + 1);
                } else
                    replicaMap.put(svcName, 1);
            }
            for (int j = 0; j < system.getNetworks().get(i).getServices().size(); j++) {
                Service svc = system.getNetworks().get(i).getServices().get(j);
                String svcName = svc.getName() + svc.getUri();
                if (replicaMap.get(svcName) == 0)
                    continue;
                svcs.append("    " + svc.getName() + svc.getId() + ":\n");

                svcs.append("        image: " + (svc.getImage() != null ? svc.getImage() : "[INSERT_IMAGE]") + "\n");
                if (svc instanceof Docker) {
                    Docker d = ((Docker) svc);
                    svcs.append("        ports:\n");
                    d.getPorts().forEach((ep, ip) -> svcs.append("            - \"" + ep + ":" + ip + "\"\n"));
                } else {
                    if (svc.getInputPorts().size() > 0) {
                        svcs.append("        ports:\n");
                        getPorts(svc.getInputPorts(), svcs);
                    }
                }
                if (replicaMap.get(svcName) > 1) {
                    svcs.append("        replicas: " + replicaMap.get(svcName) + "\n");
                    replicaMap.put(svcName, 0);
                }
                svcs.append("        networks:\n");
                addNetworks(svc, i, system.getNetworks(), svcs);
            }
        }

        return svcs.append("\n").toString();
    }

    private void addNetworks(Service svc, int currNetwork, List<Network> allNetworks, StringBuilder strBuilder) {
        Set<Integer> connectedIntegers = findNetworks(svc, currNetwork, allNetworks);
        connectedIntegers.forEach(i -> {
            strBuilder.append("            - network" + i + "\n");
        });
    }

    private Set<Integer> findNetworks(Service svc, int currNetwork, List<Network> allNetworks) {
        Set<Integer> connectedNetworks = new HashSet<>();
        connectedNetworks.add(currNetwork);
        for (int i = 0; i < allNetworks.size(); i++) {
            final int nwk = i;
            if (currNetwork == i)
                continue;
            Network n = allNetworks.get(i);
            // TODO check if this is working
            n.getServices().forEach(s -> {
                // if (s.getInputPorts().size() == 0)
                // return;
                svc.getInputPorts().forEach(ip -> {
                    if (ip.getLocation().equalsIgnoreCase("local"))
                        return;
                    if (getListOfOutputPortLocations(s).contains(ip.getLocation()))
                        connectedNetworks.add(nwk);
                });
                svc.getOutputPorts().forEach(op -> {
                    if (op.getLocation().equalsIgnoreCase("local"))
                        return;
                    if (getListOfInputPortLocations(s).contains(op.getLocation()))
                        connectedNetworks.add(nwk);
                });
            });
        }
        return connectedNetworks;
    }

    private Set<String> getListOfInputPortLocations(Service svc) {
        Set<String> res = new HashSet<>();
        if (svc.getInputPorts().isEmpty())
            return res;
        svc.getInputPorts().forEach(op -> {
            if (op.getLocation().equalsIgnoreCase("local"))
                return;
            res.add(op.getLocation());
        });
        return res;
    }

    private Set<String> getListOfOutputPortLocations(Service svc) {
        Set<String> res = new HashSet<>();
        if (svc.getOutputPorts().isEmpty())
            return res;
        svc.getOutputPorts().forEach(op -> {
            if (op.getLocation().equalsIgnoreCase("local"))
                return;
            res.add(op.getLocation());
        });
        return res;
    }

    private void getPorts(List<InputPort> portList, StringBuilder strBuilder) {
        Set<Integer> seenPorts = new HashSet<>();
        portList.forEach(port -> {
            if (port.getLocation().equalsIgnoreCase("local"))
                return;
            seenPorts.add(
                    Integer.parseInt(
                            port.getLocation().substring(port.getLocation().lastIndexOf(":") + 1).split("/")[0]));
        });
        seenPorts.forEach(port -> strBuilder.append("            - \"" + port + ":" + port + "\"\n"));
    }

    private String genNetworks() {
        StringBuffer networks = new StringBuffer("networks:\n");

        for (int i = 0; i < system.getNetworks().size(); i++) {
            networks.append("    " + "network" + i + ":\n");
            networks.append("        " + "name: network" + i + "\n");
        }

        return networks.toString();
    }
}
