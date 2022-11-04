package joliex.jolievisualize.PlaceGraph;

import java.util.ArrayList;
import java.util.List;

import org.json.simple.JSONObject;

import joliex.jolievisualize.PlaceGraph.Node.NodeType;

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

    public Node addNode(long id, NodeType type) {
        Node n = new Node(id, type);
        nodes.add(n);
        return n;
    }

    public List<JSONObject> toJSON() {
        // Map<String, Object> map = new HashMap<>();

        List<JSONObject> childrenTmp = new ArrayList<>();
        for (Node n : nodes)
            childrenTmp.add(n.toJSON());

        return childrenTmp;
    }
}
