package emilovcina.jolievisualize.System;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

public class InputPort extends OutputPort {

    private List<Aggregate> aggregates = new ArrayList<>();
    private List<Courier> couriers = new ArrayList<>();
    private Map<String, String> redirects = new HashMap<>();

    public InputPort(String name, String protocol, String location) {
        super(name, protocol, location);
    }

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    @Override
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();

        map.put("name", getName());
        map.put("location", getLocation());
        map.put("protocol", getProtocol());

        if (getAnnotation() != null && getAnnotation().length() > 0)
            map.put("annotation", getAnnotation());

        if (getCodeRanges().size() > 0) {
            List<JSONObject> codeRangeTmp = new ArrayList<>();
            getCodeRanges().forEach(cr -> {
                codeRangeTmp.add(cr.toJSON());
            });
            map.put("ranges", codeRangeTmp);
        }

        if (getInterfaces().size() > 0) {
            List<JSONObject> interfacesTmp = new ArrayList<>();
            getInterfaces().forEach((id, name) -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", name);
                tmp.put("id", id);
                interfacesTmp.add(new JSONObject(tmp));
            });
            map.put("interfaces", interfacesTmp);
        }

        if (getRROperations().size() > 0) {
            List<JSONObject> rrTmp = new ArrayList<>();
            getRROperations().forEach(rr -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", rr.id());
                tmp.put("req", rr.requestType().name());
                tmp.put("res", rr.responseType().name());
                rrTmp.add(new JSONObject(tmp));
            });
            map.put("reqres", rrTmp);
        }
        if (getOWOperations().size() > 0) {
            List<JSONObject> owTmp = new ArrayList<>();
            getOWOperations().forEach(ow -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", ow.id());
                tmp.put("req", ow.requestType().name());
                owTmp.add(new JSONObject(tmp));
            });
            map.put("oneway", owTmp);
        }

        if (aggregates.size() > 0) {
            List<JSONObject> aggregateTmp = new ArrayList<>();
            for (Aggregate aggr : aggregates)
                aggregateTmp.add(aggr.toJSON());

            map.put("aggregates", aggregateTmp);
        }

        if (redirects.size() > 0) {
            List<JSONObject> redirectTmp = new ArrayList<>();
            redirects.forEach((name, port) -> {
                Map<String, Object> tmp = new HashMap<>();
                tmp.put("name", name);
                tmp.put("port", port);
                redirectTmp.add(new JSONObject(tmp));
            });
            map.put("redirects", redirectTmp);
        }

        if (couriers.size() > 0) {
            List<JSONObject> courierTmp = new ArrayList<>();
            for (Courier c : couriers)
                courierTmp.add(c.toJSON());
            map.put("couriers", courierTmp);
        }

        return new JSONObject(map);
    }

    /**
     * =============================================
     * LIST ADDERS:
     */
    public void addCourier(Courier c) {
        couriers.add(c);
    }

    public void addRedirect(String name, String portName) {
        redirects.put(name, portName);
    }

    public void addAggregate(Aggregate a) {
        aggregates.add(a);
    }
}
