package joliex.jolievisualize.PlaceGraph;

import java.util.ArrayList;
import java.util.List;

public class Node {
    public enum NodeType {
        NETWORK, SERVICE, SITE;
    }

    public String name;
    public NodeType type;
    public List<Node> children;

    public Node(String name, NodeType nodetype) {
        this.name = name;
        this.type = nodetype;
        children = new ArrayList<>();
    }
}
