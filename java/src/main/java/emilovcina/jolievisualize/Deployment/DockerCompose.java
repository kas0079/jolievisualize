package emilovcina.jolievisualize.Deployment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.Deployment.Build.BuildFolder;
import emilovcina.jolievisualize.System.Docker;
import emilovcina.jolievisualize.System.InputPort;
import emilovcina.jolievisualize.System.JolieSystem;
import emilovcina.jolievisualize.System.Network;
import emilovcina.jolievisualize.System.Service;

public class DockerCompose {

    private class ComposeService {
        public Service service;
        public String name;
        public BuildFolder folder;
        public int replicas;
        public boolean isDocker = false;
        public Set<Integer> networks;
        public int currentNetwork;

        @Override
        public boolean equals(Object other) {
            if (!(other instanceof ComposeService))
                return false;
            ComposeService oc = (ComposeService) other;
            if (this.service.getId() == oc.service.getId())
                return true;
            if (isDocker && oc.isDocker) {
                Docker dockerSvc = (Docker) service;
                Docker otherSvc = (Docker) oc.service;
                return dockerSvc.getName().equals(otherSvc.getName())
                        && dockerSvc.getImage().equals(otherSvc.getImage())
                        && dockerSvc.getPorts().entrySet().containsAll(otherSvc.getPorts().entrySet())
                        && otherSvc.getPorts().entrySet().containsAll(dockerSvc.getPorts().entrySet())
                        && this.currentNetwork == oc.currentNetwork
                        && oc.networks.containsAll(this.networks)
                        && this.networks.containsAll(oc.networks)
                        && isEnvMatching(dockerSvc.getEnvJSON(), otherSvc.getEnvJSON());
            } else if (isDocker && !oc.isDocker || !isDocker && oc.isDocker)
                return false;
            return this.service.getName().equals(oc.service.getName())
                    && this.service.getUri().equals(oc.service.getUri())
                    && this.currentNetwork == oc.currentNetwork
                    && oc.networks.containsAll(this.networks)
                    && this.networks.containsAll(oc.networks)
                    && isEnvMatching(this.service.getEnvJSON(), oc.service.getEnvJSON())
                    && oc.service.getVolumes().containsAll(this.service.getVolumes())
                    && this.service.getVolumes().containsAll(oc.service.getVolumes());
        }
    }

    private final JolieSystem system;
    private final List<BuildFolder> folders;

    public DockerCompose(JolieSystem system, List<BuildFolder> folders) {
        this.system = system;
        this.folders = folders;
    }

    public String generateComposeFile() {
        StringBuilder str = new StringBuilder();
        str.append(genServices());
        str.append(genNetworks());
        return str.toString();
    }

    private String genServices() {
        StringBuilder strBuilder = new StringBuilder("services:\n");
        for (int i = 0; i < system.getNetworks().size(); i++) {
            List<ComposeService> services = getComposeServices(system.getNetworks().get(i).getServices(), i);
            services.forEach(cs -> {
                Service svc = cs.service;
                strBuilder.append("    " + cs.name + ":\n");
                if (svc.getImage() != null)
                    strBuilder.append("        image: " + svc.getImage() + "\n");
                else
                    strBuilder.append("        build: ./" + cs.folder.name + "\n");

                if (cs.isDocker) {
                    Docker d = ((Docker) svc);
                    strBuilder.append("        ports:\n");
                    d.getPorts().forEach((ep, ip) -> strBuilder.append("            - \"" + ep + ":" + ip +
                            "\"\n"));
                } else {
                    if (svc.getInputPorts().size() > 0 && DeployUtils.getExposedPorts(svc.getInputPorts()).size() > 0) {
                        strBuilder.append("        ports:\n");
                        getPorts(svc.getInputPorts(), strBuilder);
                    }
                }
                if (cs.replicas > 1) {
                    strBuilder.append("        replicas: " + cs.replicas + "\n");
                }
                if (svc.getVolumes().size() > 0) {
                    strBuilder.append("        volumes:\n");
                    for (String s : svc.getVolumes()) {
                        strBuilder.append("            - type: bind\n" + "              source: -res"
                                + (s.startsWith("/") ? "" : "/") + s
                                + "\n              target: /var/temp/" + s + "\n");
                    }
                }
                if (svc.getEnvJSON() != null) {
                    strBuilder.append("        environment:\n");
                    for (Object o : svc.getEnvJSON().keySet()) {
                        Object val = svc.getEnvJSON().get(o);
                        if (val instanceof Long)
                            strBuilder.append(
                                    "           - " + ((String) o) + "=" + ((Long) svc.getEnvJSON().get(o)) + "\n");
                        else
                            strBuilder.append(
                                    "           - " + ((String) o) + "=" + ((String) svc.getEnvJSON().get(o)) + "\n");
                    }
                }
                strBuilder.append("        networks:\n");
                addNetworks(svc, cs.currentNetwork, system.getNetworks(), strBuilder);
            });
        }
        return strBuilder.toString();
    }

    private List<ComposeService> getComposeServices(List<Service> serviceList,
            int currentNetwork) {
        List<ComposeService> res = new ArrayList<>();
        serviceList.forEach(svc -> {
            ComposeService cs = new ComposeService();
            if (svc instanceof Docker)
                cs.isDocker = true;
            cs.service = svc;
            cs.name = svc.getName() + svc.getId();
            cs.networks = findNetworks(svc, currentNetwork, system.getNetworks());
            // cs.volume.addAll(svc.getVolume());
            cs.replicas = 1;
            cs.currentNetwork = currentNetwork;
            cs.folder = findBuildFolder(svc);
            ComposeService tmp = containComposeService(cs, res);
            if (tmp == null || isNewService(svc))
                res.add(cs);
            else
                tmp.replicas++;
        });
        return res;
    }

    private boolean isNewService(Service service) {
        if (service instanceof Docker)
            return false;
        BuildFolder tmp = findBuildFolder(service);
        return tmp.name.equals(service.getId() + service.getName());
    }

    private BuildFolder findBuildFolder(Service service) {
        List<BuildFolder> tmp = folders.stream()
                .filter(t -> t.target.equals(service.getName()) && t.mainFile.equals(service.getUri()))
                .collect(Collectors.toList());
        Optional<BuildFolder> specific = tmp.stream().filter(t -> t.name.equals(service.getId() + service.getName()))
                .findFirst();
        if (specific.isPresent())
            return specific.get();
        return tmp.isEmpty() ? null : tmp.get(0);
    }

    private ComposeService containComposeService(ComposeService cs, List<ComposeService> list) {
        List<ComposeService> tmp = list.stream().filter(t -> t.equals(cs)).collect(Collectors.toList());
        return tmp.isEmpty() ? null : tmp.get(0);
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
            n.getServices().forEach(s -> {
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
        Set<Integer> seenPorts = DeployUtils.getExposedPorts(portList);
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

    private boolean isEnvMatching(JSONObject j1, JSONObject j2) {
        Map<String, Object> m1 = new HashMap<>();
        Map<String, Object> m2 = new HashMap<>();

        if (j1 == null && j2 == null)
            return true;
        if ((j1 == null) != (j2 == null))
            return false;

        for (Object o : j1.keySet())
            m1.put((String) o, j1.get((String) o));
        for (Object o : j2.keySet())
            m2.put((String) o, j2.get((String) o));

        if (m1.size() != m2.size())
            return false;
        return m1.entrySet().stream()
                .allMatch(e -> e.getValue().equals(m2.get(e.getKey())));
    }
}
