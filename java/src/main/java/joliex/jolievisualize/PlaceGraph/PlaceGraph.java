package joliex.jolievisualize.PlaceGraph;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class PlaceGraph {
    public List<Node> nodes = new ArrayList<>();

    private long highestNetworkNode = -1;
    private long highestServiceNode = -1;
    private long highestSitekNode = -1;

    public long getNewNetworkNodeID() {
        return ++highestNetworkNode;
    }

    public long getNewServiceNodeID() {
        return ++highestServiceNode;
    }

    public long getNewSiteNodeID() {
        return ++highestSitekNode;
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        return new JSONObject(map);
    }
}
