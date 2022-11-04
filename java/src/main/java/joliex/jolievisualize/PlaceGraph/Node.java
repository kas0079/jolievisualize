package joliex.jolievisualize.PlaceGraph;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class Node {
    public enum NodeType {
        NETWORK, SERVICE, SITE;
    }

    public String name;
    public long id;
    public NodeType type;
    public List<Node> children;
    public Node parent;

    public Node(long id, NodeType nodetype) {
        this.id = id;
        this.type = nodetype;
        children = new ArrayList<>();
    }

    public Node(long id, String name, NodeType nodetype) {
        this.id = id;
        this.name = name;
        this.type = nodetype;
        children = new ArrayList<>();
    }

    public boolean containsSite() {
        for (Node n : children)
            if (n.type == NodeType.SITE)
                return true;
        return false;
    }

    public Node addNode(long id, NodeType type) {
        Node n = new Node(id, type);
        this.children.add(n);
        return n;
    }

    public Node addNode(long id, String name, NodeType type) {
        Node n = new Node(id, name, type);
        this.children.add(n);
        return n;
    }

    public Node addNode(Node node) {
        this.children.add(node);
        return node;
    }

    public void addNodeList(List<Node> list) {
        list.forEach((n) -> this.children.add(n));
    }

    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        if (name != null)
            map.put("name", name);
        map.put("id", id);
        map.put("type", type.toString().toLowerCase());

        if (children.size() > 0) {
            List<JSONObject> childrenTmp = new ArrayList<>();
            for (Node n : children)
                childrenTmp.add(n.toJSON());
            map.put("nodes", childrenTmp);
        }

        return new JSONObject(map);
    }
}
