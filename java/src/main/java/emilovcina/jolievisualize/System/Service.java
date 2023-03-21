package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.CodeRange;
import jolie.lang.parse.ast.ExecutionInfo;

public class Service {
    private String name;
    private long id;
    private ExecutionInfo executionInfo;

    private String uri;
    private String paramFile;
    private JSONObject paramJSON;
    private JSONObject envJSON;

    private List<OutputPort> outputPorts = new ArrayList<>();
    private List<InputPort> inputPorts = new ArrayList<>();
    private List<Courier> couriers = new ArrayList<>();

    private List<Service> children;
    private Service parent;
    private String bindingPortName;

    private String image;
    private String containerName;

    private List<CodeRange> codeRanges = new ArrayList<>();
    private Set<String> dependencies = new HashSet<>();
    private List<String> volumes = new ArrayList<>();
    private String args;

    private Map<Integer, Integer> dockerPorts = new HashMap<>();

    public Service(long id) {
        this.id = id;
        children = new ArrayList<>();
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("execution", getExecution());
        map.put("id", id);

        if (codeRanges.size() > 0 && uri != null && uri.length() > 0) {
            List<JSONObject> codeRangeTmp = new ArrayList<>();
            codeRanges.forEach(cr -> {
                codeRangeTmp.add(cr.toJSON());
            });
            map.put("ranges", codeRangeTmp);
        }

        if (image != null)
            map.put("image", image);

        if (uri != null && uri.length() > 0)
            map.put("file", uri);

        if (paramFile != null && paramFile.length() > 0)
            map.put("paramFile", paramFile);
        else if (paramJSON != null)
            map.put("params", paramJSON);

        if (bindingPortName != null)
            map.put("parentPort", bindingPortName);

        if (volumes.size() > 0)
            map.put("volumes", volumes);

        if (args != null)
            map.put("args", args);

        if (envJSON != null)
            map.put("env", envJSON);

        if (dockerPorts.size() > 0) {
            List<JSONObject> portTmp = new ArrayList<>();
            dockerPorts.forEach((i, o) -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("iport", i);
                tmp.put("eport", o);
                portTmp.add(new JSONObject(tmp));
            });
            map.put("ports", portTmp);
        }

        if (outputPorts.size() > 0) {
            List<JSONObject> opListTmp = new ArrayList<>();
            for (OutputPort op : outputPorts)
                opListTmp.add(op.toJSON());
            map.put("outputPorts", opListTmp);
        }

        if (inputPorts.size() > 0) {
            List<JSONObject> ipListTmp = new ArrayList<>();
            for (InputPort ip : inputPorts)
                ipListTmp.add(ip.toJSON());
            map.put("inputPorts", ipListTmp);
        }

        if (children.size() > 0) {
            List<JSONObject> childTmp = new ArrayList<>();
            for (Service s : children)
                childTmp.add(s.toJSON());
            map.put("embeddings", childTmp);
        }

        if (containerName != null)
            map.put("container", containerName);

        return new JSONObject(map);
    }

    public void removeChildWithID(long id) {
        for (int i = 0; i < children.size(); i++)
            if (children.get(i).id == id) {
                children.remove(i);
                return;
            }
    }

    public void addVolume(String conf) {
        if (conf.startsWith("./"))
            this.volumes.add(conf.substring(2));
        else if (conf.startsWith("/"))
            this.volumes.add(conf.substring(1));
        else
            this.volumes.add(conf);
    }

    public void addCourier(Courier c) {
        couriers.add(c);
    }

    public void addOutputPort(OutputPort op) {
        outputPorts.add(op);
    }

    public void addInputPort(InputPort ip) {
        inputPorts.add(ip);
    }

    public void addDependencyFile(String filePath) {
        if (filePath == null || filePath.equalsIgnoreCase(this.uri) || filePath.equals(""))
            return;
        this.dependencies.add(filePath);
    }

    public void addCodeRange(CodeRange cr) {
        codeRanges.add(cr);
    }

    public void addDockerPort(int outPort, int inPort) {
        dockerPorts.put(outPort, inPort);
    }

    public void addChild(Service s) {
        children.add(s);
    }

    public String getArgs() {
        return args;
    }

    public void setArgs(String args) {
        this.args = args;
    }

    public List<Courier> getCouriers() {
        return this.couriers;
    }

    public Set<String> getDependencies() {
        return this.dependencies;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getParamFile() {
        return this.paramFile;
    }

    public void setParamFile(String filename) {
        this.paramFile = filename;
    }

    public List<String> getVolumes() {
        return this.volumes;
    }

    public String getContainerName() {
        return containerName;
    }

    public void setContainerName(String name) {
        this.containerName = name;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String n) {
        this.name = n;
    }

    public void setBindingPortName(String n) {
        this.bindingPortName = n;
    }

    public Service getParent() {
        return parent;
    }

    public void setParent(Service s) {
        parent = s;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public JSONObject getEnvJSON() {
        return envJSON;
    }

    public void setEnvJSON(JSONObject envJSON) {
        this.envJSON = envJSON;
    }

    public long getId() {
        return this.id;
    }

    public List<Service> getChildren() {
        return children;
    }

    public String getUri() {
        return uri;
    }

    public List<InputPort> getInputPorts() {
        return inputPorts;
    }

    public List<OutputPort> getOutputPorts() {
        return outputPorts;
    }

    public String getExecution() {
        if (executionInfo == null)
            return "single";
        return executionInfo.mode().name().toLowerCase();
    }

    public void setExectionInfo(ExecutionInfo ei) {
        this.executionInfo = ei;
    }

    public JSONObject getParamJSON() {
        return this.paramJSON;
    }

    public void setParamJSON(JSONObject params) {
        this.paramJSON = params;
    }

    public Map<Integer, Integer> getPorts() {
        return dockerPorts;
    }
}
