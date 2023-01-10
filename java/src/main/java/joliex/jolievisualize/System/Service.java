package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.parse.ast.ExecutionInfo;

public class Service {
    private String name;
    private long id;
    private ExecutionInfo executionInfo;

    private String uri;

    private List<OutputPort> outputPorts = new ArrayList<>();
    private List<InputPort> inputPorts = new ArrayList<>();
    private List<Courier> couriers = new ArrayList<>();

    private List<Service> children;
    private Service parent;
    private String bindingPortName;

    public Service(long id) {
        this.id = id;
        children = new ArrayList<>();
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", name);
        map.put("execution", getExecution());
        map.put("id", id);

        if (uri != null && uri.length() > 0)
            map.put("file", uri);

        if (bindingPortName != null)
            map.put("parentPort", bindingPortName);

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

        return new JSONObject(map);
    }

    public List<Courier> getCouriers() {
        return this.couriers;
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

    public void setName(String n) {
        this.name = n;
    }

    public void setBindingPortName(String n) {
        this.bindingPortName = n;
    }

    public void setParent(Service s) {
        parent = s;
    }

    public void addChild(Service s) {
        children.add(s);
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public void removeChildWithID(long id) {
        for (int i = 0; i < children.size(); i++)
            if (children.get(i).id == id) {
                children.remove(i);
                return;
            }
    }

    public Service getParent() {
        return parent;
    }

    public List<Service> getChildren() {
        return children;
    }

    public String getExecution() {
        if (executionInfo == null)
            return "single";
        return executionInfo.mode().name().toLowerCase();
    }

    public void setExectionInfo(ExecutionInfo ei) {
        this.executionInfo = ei;
    }
}
