package emilovcina.jolievisualize.Deployment;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.System.InputPort;

public class DeployUtils {

    /**
     * Gets exposed ports as integers from a list of inputPorts. This is used to
     * make the deployment.yml file contents
     * 
     * @param portList List of input ports
     * @return set of port numbers
     */
    public static Set<Integer> getExposedPorts(List<InputPort> portList) {
        Set<Integer> seenPorts = new HashSet<>();
        portList.forEach(port -> {
            if (port.getLocation().equalsIgnoreCase("local") || port.getLocation().endsWith(".ini")
                    || !port.getLocation().contains(":"))
                return;
            if (!isNumeric(port.getLocation().substring(port.getLocation().lastIndexOf(":") + 1).split("/")[0]))
                return;
            seenPorts.add(Integer
                    .parseInt(port.getLocation().substring(port.getLocation().lastIndexOf(":") + 1).split("/")[0]));
        });
        return seenPorts;
    }

    /**
     * Check if two strings which can be null are equals.
     * 
     * @param attr1 String attribute possibly null
     * @param attr2 String attribute possibly null
     * @return true if equal
     */
    public static boolean checkStringAttribute(String attr1, String attr2) {
        if (attr1 == null && attr2 == null)
            return true;
        return ((attr2 == null) == (attr1 == null)) && attr2.equals(attr1);
    }

    /**
     * Checks if two json objects have matching fields and values.
     * 
     * @param j1 JSON Object
     * @param j2 JSON Object
     * @return true if the two json objects have matching fields and values.
     */
    public static boolean isJSONMatching(JSONObject j1, JSONObject j2) {
        Map<String, Object> m1 = new HashMap<>();
        Map<String, Object> m2 = new HashMap<>();

        if (j1 == null && j2 == null)
            return true;
        if ((j1 == null) != (j2 == null))
            return false;

        for (Object o : j1.keySet())
            m1.put((String) o, j1.get((String) o));
        for (Object o : j2.keySet())
            m2.put((String) o, j2.get((String) o));

        if (m1.size() != m2.size())
            return false;
        return m1.entrySet().stream().allMatch(e -> e.getValue().equals(m2.get(e.getKey())));
    }

    /**
     * Checks if parsing string to number gives an error
     * 
     * @param strNum String to parse
     * @return true if string is parseable
     */
    private static boolean isNumeric(String strNum) {
        if (strNum == null)
            return false;
        try {
            Double.parseDouble(strNum);
        } catch (NumberFormatException nfe) {
            return false;
        }
        return true;
    }
}
