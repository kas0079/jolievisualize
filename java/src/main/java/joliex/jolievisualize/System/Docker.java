package joliex.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Docker extends Service {
    private String image;
    private Map<Integer, Integer> dockerPorts = new HashMap<>();

    public Docker(long id) {
        super(id);
    }

    @Override
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", getName());
        map.put("image", image);
        map.put("id", getId());

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

        return new JSONObject(map);
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void addDockerPort(int outPort, int inPort) {
        dockerPorts.put(outPort, inPort);
    }
}
