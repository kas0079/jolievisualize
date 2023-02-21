package emilovcina.jolievisualize.Deployment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.System.InputPort;
import emilovcina.jolievisualize.System.JolieSystem;

public class Build {

    private class BuildFolder {
        public String name;
        public String mainFile;
        public List<String> files = new ArrayList<>();
        public List<Integer> exposed = new ArrayList<>();
        public String params;
    }

    private final JolieSystem system;
    private String deployString;

    public Build(JolieSystem system, String deployString) {
        this.system = system;
        this.deployString = deployString;
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("deployment", deployString);

        List<JSONObject> folders = new ArrayList<>();
        createFolders().forEach(folder -> {
            Map<String, Object> tmp = new HashMap<>();
            tmp.put("name", folder.name);
            tmp.put("main", folder.mainFile);
            tmp.put("files", folder.files);
            if (folder.params != null)
                tmp.put("params", folder.params);
            if (folder.exposed != null && folder.exposed.size() > 0)
                tmp.put("expose", folder.exposed);
            // todo add the two lists
            folders.add(new JSONObject(tmp));

        });
        map.put("folders", folders);

        return new JSONObject(map);
    }

    private List<BuildFolder> createFolders() {
        List<BuildFolder> res = new ArrayList<>();
        system.getNetworks().forEach(network -> {
            network.getServices().forEach(service -> {
                if (service.getImage() != null)
                    return;
                BuildFolder bf = new BuildFolder();
                bf.name = service.getName();
                bf.mainFile = service.getUri();
                bf.files.addAll(service.getDependencies());
                if (service.getParamFile() != null) {
                    bf.params = service.getParamFile();
                    bf.files.add(service.getParamFile());
                }
                if (service.getInputPorts().size() > 0) {
                    bf.exposed.addAll(getExposedPorts(service.getInputPorts()));
                }
                res.add(bf);
            });
        });
        return res;
    }

    private Set<Integer> getExposedPorts(List<InputPort> portList) {
        Set<Integer> seenPorts = new HashSet<>();
        portList.forEach(port -> {
            if (port.getLocation().equalsIgnoreCase("local") || port.getLocation().endsWith(".ini"))
                return;
            seenPorts.add(
                    Integer.parseInt(
                            port.getLocation().substring(port.getLocation().lastIndexOf(":") + 1).split("/")[0]));
        });
        return seenPorts;
    }
}
