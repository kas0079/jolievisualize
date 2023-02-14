package joliex.jolievisualize.Deployment;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import joliex.jolievisualize.System.Docker;
import joliex.jolievisualize.System.JolieSystem;
import joliex.jolievisualize.System.OutputPort;
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
                    svcs.append("        ports:\n");
                    genPorts(svc.getOutputPorts(), svcs);
                    genPorts(svc.getInputPorts(), svcs);
                }
                if (replicaMap.get(svcName) > 1) {
                    svcs.append("        replicas: " + replicaMap.get(svcName) + "\n");
                    replicaMap.put(svcName, 0);
                }
                svcs.append("        networks:\n");
                svcs.append("            - network" + i + "\n");
            }
        }

        return svcs.append("\n").toString();
    }

    private void genPorts(List<? extends OutputPort> portList, StringBuilder strBuilder) {
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
