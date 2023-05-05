package emilovcina.jolievisualize.Deployment;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import emilovcina.jolievisualize.Deployment.Build.BuildFolder;
import emilovcina.jolievisualize.System.Docker;
import emilovcina.jolievisualize.System.InputPort;
import emilovcina.jolievisualize.System.JolieSystem;
import emilovcina.jolievisualize.System.Network;
import emilovcina.jolievisualize.System.Service;

public class DockerCompose {

    /**
     * Represents a service in the docker-compose yaml
     */
    private class ComposeService {
        public Service service;
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
                        && otherSvc.getContainerName().equals(dockerSvc.getContainerName())
                        && this.currentNetwork == oc.currentNetwork && oc.networks.containsAll(this.networks)
                        && this.networks.containsAll(oc.networks)
                        && DeployUtils.isJSONMatching(dockerSvc.getEnvJSON(), otherSvc.getEnvJSON())
                        && DeployUtils.checkStringAttribute(
                                dockerSvc.getContainerName() == null ? dockerSvc.getName()
                                        : dockerSvc.getContainerName(),
                                otherSvc.getContainerName() == null ? otherSvc.getName() : otherSvc.getContainerName());
            } else if (isDocker && !oc.isDocker || !isDocker && oc.isDocker)
                return false;
            return this.service.getName().equals(oc.service.getName())
                    && this.service.getUri().equals(oc.service.getUri()) && this.currentNetwork == oc.currentNetwork
                    && oc.networks.containsAll(this.networks) && this.networks.containsAll(oc.networks)
                    && DeployUtils.isJSONMatching(this.service.getEnvJSON(), oc.service.getEnvJSON())
                    && oc.service.getVolumes().containsAll(this.service.getVolumes())
                    && DeployUtils.checkStringAttribute(
                            this.service.getContainerName() == null ? this.service.getName()
                                    : this.service.getContainerName(),
                            oc.service.getContainerName() == null ? oc.service.getName()
                                    : oc.service.getContainerName())
                    && this.service.getVolumes().containsAll(oc.service.getVolumes());
        }
    }

    private final JolieSystem system;
    private final List<BuildFolder> folders;
    private final String buildFolder;

    public DockerCompose(JolieSystem system, List<BuildFolder> folders, String buildFolder) {
        this.system = system;
        this.folders = folders;
        this.buildFolder = buildFolder;
    }

    /**
     * Generates the docker-compose yaml
     * 
     * @return yaml file content
     */
    public String generateComposeFile() {
        StringBuilder str = new StringBuilder();
        str.append(genServices());
        str.append(genNetworks());
        return str.toString();
    }

    /**
     * Helper function to generate the yaml content for each top level service in
     * the networks
     * 
     * @return yaml content for services
     */
    private String genServices() {
        StringBuilder strBuilder = new StringBuilder("services:\n");
        for (int i = 0; i < system.getNetworks().size(); i++) {
            List<ComposeService> services = getComposeServices(system.getNetworks().get(i).getServices(), i);
            services.forEach(cs -> {
                Service svc = cs.service;
                strBuilder.append("    " + "s" + cs.service.getId() + "_" + cs.service.getName().toLowerCase() + ":\n");
                if (svc.getContainerName() != null)
                    strBuilder.append("        container_name: " + svc.getContainerName() + "\n");
                else
                    strBuilder.append("        container_name: " + svc.getName() + "\n");

                if (svc.getImage() != null)
                    strBuilder.append("        image: " + svc.getImage() + "\n");
                else
                    strBuilder.append("        build: ./" + cs.folder.name + "\n");

                if (cs.isDocker) {
                    Docker d = ((Docker) svc);
                    strBuilder.append("        ports:\n");
                    d.getPorts().forEach((ep, ip) -> strBuilder.append("            - \"" + ep + ":" + ip + "\"\n"));
                } else {
                    if (svc.getPorts().size() > 0 || svc.getInputPorts().size() > 0
                            && DeployUtils.getExposedPorts(svc.getInputPorts()).size() > 0) {
                        strBuilder.append("        ports:\n");
                        if (svc.getInputPorts().size() > 0
                                && DeployUtils.getExposedPorts(svc.getInputPorts()).size() > 0)
                            getPorts(svc.getInputPorts(), strBuilder);
                        if (svc.getPorts().size() > 0)
                            svc.getPorts().forEach(
                                    (ep, ip) -> strBuilder.append("            - \"" + ep + ":" + ip + "\"\n"));
                    }
                }
                if (cs.replicas > 1) {
                    strBuilder.append("        replicas: " + cs.replicas + "\n");
                }
                if (svc.getVolumes().size() > 0) {
                    strBuilder.append("        volumes:\n");
                    for (String s : svc.getVolumes()) {
                        strBuilder.append("            - type: bind\n" + "              source: "
                                + system.getVisFilePath().getParent().toAbsolutePath().toString() + buildFolder
                                + "/-res" + (s.startsWith("/") ? "" : "/") + s + "\n              target: /var/temp/"
                                + s + "\n");
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

    /**
     * Makes the docker compose service objects from the list of services in a
     * network
     * 
     * @param serviceList    List of services
     * @param currentNetwork network ID of the services
     * @return List of docker compose service objects
     */
    private List<ComposeService> getComposeServices(List<Service> serviceList, int currentNetwork) {
        List<ComposeService> res = new ArrayList<>();
        serviceList.forEach(svc -> {
            ComposeService cs = new ComposeService();
            if (svc instanceof Docker)
                cs.isDocker = true;
            cs.service = svc;
            cs.networks = findNetworks(svc, currentNetwork, system.getNetworks());
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

    /**
     * Checks if service has a build folder
     *
     * @param service Service
     * @return true if service is new
     */
    private boolean isNewService(Service service) {
        if (service instanceof Docker)
            return false;
        BuildFolder tmp = findBuildFolder(service);
        return tmp.name.equals(service.getId() + service.getName());
    }

    /**
     * Look for an identical build folder in the global list of folders
     * 
     * @param service service to find match for.
     * @return null if no match is found. Buildfolder for the service matching in
     *         the list
     */
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

    /**
     * Look for docker compose service in a list of compose services.
     * 
     * @param cs   Compose service to look for
     * @param list List of compose services
     * @return null if no services in the list was found, else return the matching
     *         compose service from the list
     */
    private ComposeService containComposeService(ComposeService cs, List<ComposeService> list) {
        List<ComposeService> tmp = list.stream().filter(t -> t.equals(cs)).collect(Collectors.toList());
        return tmp.isEmpty() ? null : tmp.get(0);
    }

    /**
     * Find all the networks a service is connected to or resides in.
     * 
     * @param svc         Service
     * @param currNetwork current network of the service
     * @param allNetworks All networks in the system
     * @param strBuilder  string builder to append the yaml content to.
     */
    private void addNetworks(Service svc, int currNetwork, List<Network> allNetworks, StringBuilder strBuilder) {
        Set<Integer> connectedIntegers = findNetworks(svc, currNetwork, allNetworks);
        connectedIntegers.forEach(i -> {
            strBuilder.append("            - network" + i + "\n");
        });
    }

    /**
     * Helper function which finds all the networks a service is connected to.
     * 
     * @param svc         Service
     * @param currNetwork Current network of the service
     * @param allNetworks List of all networks in the system
     * @return Set of network ID which the service is either connected to or resides
     *         in.
     */
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

    /**
     * Get all the input ports locations of a service and omit the local ports
     * 
     * @param svc Service
     * @return Set of input port locations.
     */
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

    /**
     * Get all the output ports locations of a service and omit the local ports
     * 
     * @param svc Service
     * @return Set of output port locations.
     */
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

    /**
     * Builds the exposed ports yaml content
     * 
     * @param portList   List of input ports
     * @param strBuilder String builder to append the content to.
     */
    private void getPorts(List<InputPort> portList, StringBuilder strBuilder) {
        Set<Integer> seenPorts = DeployUtils.getExposedPorts(portList);
        seenPorts.forEach(port -> strBuilder.append("            - \"" + port + ":" + port + "\"\n"));
    }

    /**
     * Creates the yaml content of the networks section of the docker compose file.
     * 
     * @return Yaml string content
     */
    private String genNetworks() {
        StringBuffer networks = new StringBuffer("networks:\n");

        for (int i = 0; i < system.getNetworks().size(); i++) {
            networks.append("    " + "network" + i + ":\n");
            networks.append("        " + "name: network" + i + "\n");
        }

        return networks.toString();
    }
}
