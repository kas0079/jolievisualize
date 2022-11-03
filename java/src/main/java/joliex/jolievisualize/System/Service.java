package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.parse.ast.EmbedServiceNode;
import jolie.lang.parse.ast.EmbeddedServiceNode;
import jolie.lang.parse.ast.ExecutionInfo;
import jolie.lang.parse.ast.courier.CourierDefinitionNode;

public class Service {
    public JSONObject params;

    public long id;
    public String name;
    public ExecutionInfo executionInfo;
    public List<CourierDefinitionNode> couriers = new ArrayList<>();
    public List<EmbedServiceNode> embeds = new ArrayList<>();
    public List<EmbeddedServiceNode> internals = new ArrayList<>();
    public List<EmbeddedServiceNode> embeddings = new ArrayList<>();

    public List<InputPort> inputPorts;
    public List<OutputPort> outputPorts;

    public Service(long id) {
        this.id = id;
    }

    public String getExecution() {
        if (executionInfo == null)
            return "single";
        return executionInfo.mode().name().toLowerCase();
    }

    public boolean equals(Service other) {
        return this.id == other.id;
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("name", name);
        map.put("execution", getExecution());

        // Input ports
        List<JSONObject> jsonIPS = new ArrayList<>();
        for (InputPort ip : inputPorts)
            jsonIPS.add(ip.toJSON());

        // Output ports
        List<JSONObject> jsonOPS = new ArrayList<>();
        for (OutputPort op : outputPorts)
            jsonOPS.add(op.toJSON());

        // Embeddings
        List<JSONObject> embedTmp = getEmbeddings();
        if (embedTmp.size() > 0)
            map.put("embeddings", embedTmp);

        if (jsonIPS.size() > 0)
            map.put("inputPorts", jsonIPS);
        if (jsonOPS.size() > 0)
            map.put("outputPorts", jsonOPS);

        return new JSONObject(map);
    }

    private List<JSONObject> getEmbeddings() {
        List<JSONObject> list = new ArrayList<>();
        if (embeds.size() > 0) {
            List<JSONObject> embedTmp = new ArrayList<>();
            for (EmbedServiceNode esn : embeds)
                embedTmp.add(getEmbeds(esn));
            list.addAll(embedTmp);
        }
        if (internals.size() > 0) {
            List<JSONObject> internalTmp = new ArrayList<>();
            for (EmbeddedServiceNode esn : internals)
                internalTmp.add(getInternals(esn));
            list.addAll(internalTmp);
        }
        if (embeddings.size() > 0) {
            List<JSONObject> embeddingTmp = new ArrayList<>();
            for (EmbeddedServiceNode esn : embeddings)
                embeddingTmp.add(getEmbeddingJSON(esn));
            list.addAll(embeddingTmp);
        }
        return list;
    }

    private JSONObject getEmbeddingJSON(EmbeddedServiceNode esn) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", esn.servicePath().replaceAll("ol", ""));
        map.put("port", esn.portId());
        map.put("type", esn.type() == null ? "jolie" : esn.type().name().toLowerCase());
        return new JSONObject(map);
    };

    private JSONObject getInternals(EmbeddedServiceNode esn) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", esn.servicePath().replaceAll("ol", ""));
        map.put("port", esn.portId());
        map.put("type", esn.type() == null ? "jolie" : esn.type().name().toLowerCase());
        return new JSONObject(map);
    }

    private JSONObject getEmbeds(EmbedServiceNode esn) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", esn.serviceName());
        if (esn.hasBindingPort())
            map.put("port", esn.bindingPort().id());
        map.put("type", "jolie");
        return new JSONObject(map);
    }
}
