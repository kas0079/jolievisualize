package joliex.jolievisualize;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

import jolie.lang.NativeType;
import jolie.lang.parse.ast.EmbedServiceNode;
import jolie.lang.parse.ast.EmbeddedServiceNode;
import jolie.lang.parse.ast.ExecutionInfo;
import jolie.lang.parse.ast.InputPortInfo;
import jolie.lang.parse.ast.InputPortInfo.AggregationItemInfo;
import jolie.lang.parse.ast.InterfaceDefinition;
import jolie.lang.parse.ast.OLSyntaxNode;
import jolie.lang.parse.ast.OneWayOperationDeclaration;
import jolie.lang.parse.ast.OutputPortInfo;
import jolie.lang.parse.ast.RequestResponseOperationDeclaration;
import jolie.lang.parse.ast.ServiceNode;
import jolie.lang.parse.ast.VariablePathNode;
import jolie.lang.parse.ast.courier.CourierChoiceStatement;
import jolie.lang.parse.ast.courier.CourierDefinitionNode;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.InterfaceOneWayBranch;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.InterfaceRequestResponseBranch;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.OperationOneWayBranch;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.OperationRequestResponseBranch;
import jolie.lang.parse.ast.expression.ConstantStringExpression;
import jolie.lang.parse.ast.expression.VariableExpressionNode;
import jolie.lang.parse.ast.types.TypeDefinition;
import jolie.lang.parse.ast.types.TypeDefinitionLink;
import jolie.lang.parse.ast.types.TypeInlineDefinition;
import jolie.lang.parse.util.ProgramInspector;
import jolie.util.Pair;
import joliex.jolievisualize.System.Aggregate;
import joliex.jolievisualize.System.Courier;
import joliex.jolievisualize.System.InputPort;
import joliex.jolievisualize.System.Interface;
import joliex.jolievisualize.System.OutputPort;
import joliex.jolievisualize.System.Service;
import joliex.jolievisualize.System.Type;

public class SystemInspector {

    private class JolieSystem {
        private long highestID = -1;
        public String name;
        public List<Service> listOfServices = new ArrayList<>();
        public List<Interface> listOfInterfaces = new ArrayList<>();
        public List<Type> listOfTypes = new ArrayList<>();

        public long getNextID() {
            return ++highestID;
        }

        public JSONObject toJSON() {
            Map<String, Object> map = new HashMap<>();

            // Services array
            List<JSONObject> serviceListTmp = new ArrayList<>();
            for (Service s : listOfServices)
                serviceListTmp.add(s.toJSON());

            // Interface array
            List<JSONObject> interfaceListTmp = new ArrayList<>();
            for (Interface i : listOfInterfaces)
                interfaceListTmp.add(i.toJSON());

            // Types
            List<JSONObject> typeListTmp = new ArrayList<>();
            for (Type t : listOfTypes)
                typeListTmp.add(t.toJSON());

            map.put("name", name);
            map.put("services", serviceListTmp);
            map.put("interfaces", interfaceListTmp);
            map.put("types", typeListTmp);
            return new JSONObject(map);
        }
    }

    private final String[] blackList = {
            "ConsoleInterface",
            "ConsoleInputInterface",
            "ConsoleInputPort",
            "StringUtilsInterface",
            "StringUtils",
            "Console",
            "File",
            "FileInterface",
            "Time",
            "TimeInterface"
    };

    private final Map<TopLevelDeploy, Pair<ProgramInspector, JSONObject>> inspectors;
    private final Set<TypeDefinition> seenTypes;
    private final JolieSystem system;

    public SystemInspector(Map<TopLevelDeploy, Pair<ProgramInspector, JSONObject>> inspectors) {
        this.inspectors = inspectors;
        seenTypes = new HashSet<>();
        system = new JolieSystem();
    }

    public JSONObject createJSON(String name) {
        system.name = name;
        dissectInspectors(inspectors);
        return system.toJSON();
    }

    private void dissectInspectors(Map<TopLevelDeploy, Pair<ProgramInspector, JSONObject>> inspectors) {
        inspectors.forEach((tld, ins) -> {
            for (ServiceNode sn : ins.key().getServiceNodes()) {
                Service s = createService(tld.getName(), sn, ins.key(), ins.value());
                if (!system.listOfServices.contains(s))
                    system.listOfServices.add(s);

            }
            for (InterfaceDefinition id : ins.key().getInterfaces()) {
                if (inBlackList(id.name()))
                    continue;
                Interface i = createInterface(id);
                if (!interfaceContains(system.listOfInterfaces, i))
                    system.listOfInterfaces.add(i);
            }
        });
        seenTypes.forEach((type) -> {
            system.listOfTypes.add(createType(type));
        });
    }

    private Type createType(TypeDefinition td) {
        Type type = new Type();
        type.name = td.name();
        if (td instanceof TypeDefinitionLink) {
            TypeDefinitionLink tdl = (TypeDefinitionLink) td;
            type.type = tdl.linkedTypeName();
        } else if (td instanceof TypeInlineDefinition) {
            TypeInlineDefinition tid = (TypeInlineDefinition) td;
            type.type = tid.basicType().nativeType().name().toLowerCase();
            if (tid.hasSubTypes())
                for (Map.Entry<String, TypeDefinition> entry : tid.subTypes())
                    type.subtypes.add(createType(entry.getValue()));
        }
        return type;
    }

    private Interface createInterface(InterfaceDefinition id) {
        Interface result = new Interface();
        result.name = id.name();
        id.operationsMap().forEach((k, v) -> {
            if (v instanceof RequestResponseOperationDeclaration) {
                RequestResponseOperationDeclaration rrd = (RequestResponseOperationDeclaration) v;
                result.reqres.add(rrd);
                if (!NativeType.isNativeTypeKeyword(rrd.requestType().name()))
                    seenTypes.add(rrd.requestType());
                if (!NativeType.isNativeTypeKeyword(rrd.responseType().name()))
                    seenTypes.add(rrd.responseType());
            } else if (v instanceof OneWayOperationDeclaration) {
                OneWayOperationDeclaration owod = (OneWayOperationDeclaration) v;
                result.oneway.add(owod);
                if (!NativeType.isNativeTypeKeyword(owod.requestType().name()))
                    seenTypes.add(owod.requestType());
            }
        });
        return result;
    }

    private Service createService(String name, ServiceNode sn, ProgramInspector ins, JSONObject params) {
        Service svc = new Service(system.getNextID());
        svc.name = sn.name().equals("Main") ? name : sn.name();
        getSyntaxInformation(svc, sn);
        svc.inputPorts = getInputPorts(ins, params, svc);
        svc.outputPorts = getOutputPorts(ins, params);
        return svc;
    }

    private void getSyntaxInformation(Service svc, ServiceNode sn) {
        for (OLSyntaxNode ol : sn.program().children()) {
            if (ol instanceof ExecutionInfo)
                svc.executionInfo = (ExecutionInfo) ol;
            else if (ol instanceof CourierDefinitionNode)
                svc.couriers.add((CourierDefinitionNode) ol);
            else if (ol instanceof EmbedServiceNode) {
                if (inBlackList(((EmbedServiceNode) ol).serviceName()))
                    continue;
                svc.embeds.add((EmbedServiceNode) ol);
            } else if (ol instanceof EmbeddedServiceNode) {
                if (((EmbeddedServiceNode) ol).servicePath().startsWith("joliex.")
                        || ((EmbeddedServiceNode) ol).program() == null)
                    continue;
                svc.internals.add((EmbeddedServiceNode) ol);
            }
        }
    }

    private List<OutputPort> getOutputPorts(ProgramInspector ins, JSONObject params) {
        List<OutputPort> list = new ArrayList<>();
        for (OutputPortInfo opi : ins.getOutputPorts()) {
            if (inBlackList(opi.id()))
                continue;
            OutputPort op = new OutputPort();
            op.name = opi.id();

            if (opi.protocol() instanceof VariableExpressionNode) {
                String t = getParamFromPath(((VariableExpressionNode) opi.protocol()).variablePath(), params);
                if (!t.equals(""))
                    op.protocol = t;
                else
                    op.protocol = !opi.protocolId().equals("") ? opi.protocolId() : "sodep";
            } else
                op.protocol = !opi.protocolId().equals("") ? opi.protocolId() : "sodep";

            if (opi.location() == null)
                op.location = "local";
            else {
                if (opi.location() instanceof VariableExpressionNode) {
                    String t = getParamFromPath(((VariableExpressionNode) opi.location()).variablePath(), params);
                    if (!t.equals(""))
                        op.location = t;
                } else
                    op.location = (opi.location().toString().endsWith("/")
                            ? opi.location().toString().substring(0, opi.location().toString().length() -
                                    1)
                            : opi.location().toString());
            }
            op.interfaces = opi.getInterfaceList();
            list.add(op);
        }
        return list;
    }

    private List<InputPort> getInputPorts(ProgramInspector ins, JSONObject params, Service svc) {
        List<InputPort> list = new ArrayList<>();
        for (InputPortInfo ipi : ins.getInputPorts()) {
            if (inBlackList(ipi.id()))
                continue;
            InputPort ip = new InputPort();
            ip.name = ipi.id();

            if (ipi.protocol() instanceof VariableExpressionNode) {
                String t = getParamFromPath(((VariableExpressionNode) ipi.protocol()).variablePath(), params);
                if (!t.equals(""))
                    ip.protocol = t;
                else
                    ip.protocol = !ipi.protocolId().equals("") ? ipi.protocolId() : "sodep";
            } else
                ip.protocol = !ipi.protocolId().equals("") ? ipi.protocolId() : "sodep";

            if (ipi.location() == null)
                ip.location = "local";
            else {
                if (ipi.location() instanceof VariableExpressionNode) {
                    String t = getParamFromPath(((VariableExpressionNode) ipi.location()).variablePath(), params);
                    if (!t.equals(""))
                        ip.location = t;
                } else
                    ip.location = (ipi.location().toString().endsWith("/")
                            ? ipi.location().toString().substring(0, ipi.location().toString().length() -
                                    1)
                            : ipi.location().toString());
            }
            for (InterfaceDefinition id : ipi.getInterfaceList())
                ip.interfaces.add(id.name());

            if (ipi.aggregationList() != null && ipi.aggregationList().length > 0)
                for (AggregationItemInfo aii : ipi.aggregationList())
                    ip.aggregates.add(createAggregate(aii));

            if (ipi.redirectionMap() != null && ipi.redirectionMap().size() > 0)
                ipi.redirectionMap().forEach((sid, op) -> {
                    ip.redirects.put(sid, op);
                });

            if (svc.couriers.size() > 0)
                for (CourierDefinitionNode cdn : svc.couriers)
                    if (cdn.inputPortName().equals(ipi.id()))
                        ip.couriers.add(createCourier(cdn));

            list.add(ip);
        }
        return list;
    }

    private Courier createCourier(CourierDefinitionNode cdn) {
        Courier cou = new Courier();
        cou.name = cdn.inputPortName();
        CourierChoiceStatement ccs = (CourierChoiceStatement) cdn.body();
        if (ccs.interfaceOneWayBranches().size() > 0)
            for (InterfaceOneWayBranch branch : ccs.interfaceOneWayBranches())
                cou.interfaceOneWay.add(branch.interfaceDefinition.name());
        if (ccs.interfaceRequestResponseBranches().size() > 0)
            for (InterfaceRequestResponseBranch branch : ccs.interfaceRequestResponseBranches())
                cou.interfaceReqRes.add(branch.interfaceDefinition.name());
        if (ccs.operationOneWayBranches().size() > 0)
            for (OperationOneWayBranch branch : ccs.operationOneWayBranches())
                cou.operationOneWay.add(branch.operation);
        if (ccs.operationRequestResponseBranches().size() > 0)
            for (OperationRequestResponseBranch branch : ccs.operationRequestResponseBranches())
                cou.operationReqRes.add(branch.operation);
        return cou;
    }

    private Aggregate createAggregate(AggregationItemInfo aii) {
        Aggregate aggr = new Aggregate();
        // Collection
        if (aii.outputPortList().length >= 2) {
            String name = "";
            for (String s : aii.outputPortList()) {
                aggr.collection.add(s);
                name += s;
            }
            aggr.name = name;
        } else
            aggr.name = aii.outputPortList()[0];
        // Interface extender
        if (aii.interfaceExtender() != null)
            aggr.extender = createInterface(aii.interfaceExtender());
        return aggr;
    }

    private String getParamFromPath(VariablePathNode vpn, JSONObject params) {
        Object obj = null;
        for (int i = 1; i < vpn.path().size(); i++) {
            Pair<OLSyntaxNode, OLSyntaxNode> o = vpn.path().get(i);
            if (o.key() != null) {
                ConstantStringExpression cse = (ConstantStringExpression) o.key();
                obj = params.get(cse.value());
                if (obj == null)
                    return "";
            }
        }
        if (obj instanceof String)
            return (String) obj;
        return "";
    }

    private boolean interfaceContains(List<Interface> list, Interface interf) {
        for (Interface i : list)
            if (interf.equals(i))
                return true;
        return false;
    }

    // public JSONObject createJSON(String name) {
    // JSONArray[] info = getInformation();
    // JSONArray services = info[0];
    // JSONArray interfaces = info[1];
    // JSONArray types = info[2];
    // JSONObject global = new JSONObject();
    // global.put("types", types);
    // global.put("interfaces", interfaces);
    // global.put("services", services);
    // global.put("name", name);
    // return global;
    // }

    // private JSONArray[] getInformation() {
    // JSONArray[] result = new JSONArray[3];
    // JSONArray services = new JSONArray();
    // JSONArray interfaces = new JSONArray();
    // JSONArray types = new JSONArray();

    // inspectors.forEach((name, ins) -> {
    // // Add service information
    // for (ServiceNode sn : ins.getServiceNodes()) {
    // SyntaxNodes syntaxNodes = getSyntaxNodes(sn);
    // JSONObject svc = createServiceObject(sn.name().equals("Main") ? name :
    // sn.name(), syntaxNodes, ins);
    // if (!services.contains(svc)) {
    // // Add internal services
    // getInternalService(syntaxNodes).forEach((internalName, program) -> {
    // ProgramInspector internal_ins = programToInspector(program);
    // for (ServiceNode i_sn : internal_ins.getServiceNodes()) {
    // SyntaxNodes i_syntaxNodes = getSyntaxNodes(i_sn);
    // JSONObject i_svc = createServiceObject(
    // i_sn.name().equals("Main") ? internalName : i_sn.name(), i_syntaxNodes,
    // internal_ins);
    // if (!services.contains(i_svc))
    // services.add(i_svc);
    // }
    // });
    // services.add(svc);
    // }
    // }

    // // add interface information
    // for (InterfaceDefinition id : ins.getInterfaces()) {
    // JSONObject intf = createInterfaceObject(id);
    // if (!interfaces.contains(intf) && !inBlackList(intf.getName().toString()))
    // interfaces.add(intf);
    // }
    // });

    // // add type information
    // inspectors.forEach((name, ins) -> {
    // types.addAll(getType(ins));
    // });
    // result[0] = services;
    // result[1] = interfaces;
    // result[2] = types;
    // return result;
    // }

    // private JSONObject createInterfaceObject(InterfaceDefinition id) {
    // JSONObject result = new JSONObject();
    // result.put("name", id.name());
    // JSONArray reqress = new JSONArray();
    // JSONArray ows = new JSONArray();

    // if (!inBlackList(id.name())) {
    // id.operationsMap().forEach((k, v) -> {
    // // Get request response operation info
    // if (v instanceof RequestResponseOperationDeclaration) {
    // RequestResponseOperationDeclaration rr =
    // (RequestResponseOperationDeclaration) v;
    // JSONObject reqres = new JSONObject();
    // reqres.put("name", rr.id());
    // reqres.put("req", rr.requestType().name());
    // reqres.put("res", rr.responseType().name());
    // reqress.add(reqres);
    // seenTypes.add(rr.requestType().name());
    // seenTypes.add(rr.responseType().name());
    // }

    // // Get one way operation info
    // if (v instanceof OneWayOperationDeclaration) {
    // OneWayOperationDeclaration ow = (OneWayOperationDeclaration) v;
    // JSONObject o = new JSONObject();
    // o.put("name", ow.id());
    // o.put("req", ow.requestType().name());
    // ows.add(o);
    // seenTypes.add(ow.requestType().name());
    // }
    // });
    // }

    // if (id instanceof InterfaceExtenderDefinition) {
    // InterfaceExtenderDefinition ied = (InterfaceExtenderDefinition) id;
    // if (ied.defaultRequestResponseOperation() != null) {
    // JSONObject defaultReqRes = new
    // JSONObject(ied.defaultRequestResponseOperation().id());
    // defaultReqRes.add("req",
    // ied.defaultRequestResponseOperation().requestType().name());
    // defaultReqRes.add("res",
    // ied.defaultRequestResponseOperation().responseType().name());
    // reqress.add(defaultReqRes);
    // seenTypes.add(ied.defaultRequestResponseOperation().requestType().name());
    // seenTypes.add(ied.defaultRequestResponseOperation().responseType().name());
    // }
    // if (ied.defaultOneWayOperation() != null) {
    // JSONObject defaultOW = new JSONObject(ied.defaultOneWayOperation().id());
    // defaultOW.add("req", ied.defaultOneWayOperation().requestType().name());
    // ows.add(defaultOW);
    // seenTypes.add(ied.defaultRequestResponseOperation().requestType().name());
    // }
    // }

    // result.add("reqres", reqress);
    // result.add("oneway", ows);
    // return result;
    // }

    // private JSONArray getType(ProgramInspector pi) {
    // JSONArray res = new JSONArray();
    // for (TypeDefinition td : pi.getTypes()) {
    // if (!seenTypes.contains(td.name()))
    // continue;
    // JSONObject jsonType = new JSONObject(td.name());
    // if (td instanceof TypeDefinitionLink) {
    // TypeDefinitionLink tdl = (TypeDefinitionLink) td;
    // jsonType.add("name", tdl.name());
    // jsonType.add("type", tdl.linkedTypeName());
    // } else if (td instanceof TypeInlineDefinition) {
    // TypeInlineDefinition tid = (TypeInlineDefinition) td;
    // if (!tid.basicType().nativeType().name().equalsIgnoreCase("void"))
    // jsonType.add("type", tid.basicType().nativeType().name().toLowerCase());
    // // Subtypes:
    // jsonType.add("subTypes", getSubTypes(tid));
    // }
    // if (!res.contains(jsonType))
    // res.add(jsonType);
    // }
    // return res;
    // }

    // private JSONArray getSubTypes(TypeInlineDefinition tid) {
    // JSONArray subtypes = new JSONArray();
    // if (tid.hasSubTypes()) {
    // for (Map.Entry<String, TypeDefinition> entry : tid.subTypes()) {
    // JSONObject res = new JSONObject();
    // if (entry.getValue() instanceof TypeDefinitionLink) {
    // TypeDefinitionLink tdl = (TypeDefinitionLink) entry.getValue();
    // res.add("name", tdl.name());
    // res.add("type", tdl.linkedTypeName());
    // } else if (entry.getValue() instanceof TypeInlineDefinition) {
    // TypeInlineDefinition tidtmp = (TypeInlineDefinition) entry.getValue();
    // res.add("name", tidtmp.name());
    // if (!tidtmp.basicType().nativeType().name().equalsIgnoreCase("void")) {
    // res.add("type", tidtmp.basicType().nativeType().name().toLowerCase());
    // }
    // res.add("subTypes", getSubTypes(tidtmp));
    // }
    // subtypes.add(res);
    // }
    // }
    // return subtypes;
    // }

    // private JSONObject createServiceObject(String name, SyntaxNodes syntaxNodes,
    // ProgramInspector ins) {
    // JSONObject svc = new JSONObject(name);
    // svc.add("execution", getExectionInfo(syntaxNodes));
    // svc.add("inputPorts", getInputPorts(syntaxNodes, ins));
    // svc.add("outputPorts", getOutputPorts(ins));

    // JSONArray embeds = getEmbeds(syntaxNodes);
    // JSONArray embeddings = getEmbeddings(ins, inspectors);
    // JSONArray internals = getInternals(syntaxNodes);
    // svc.add("embeddings", embeds.merge(embeddings).merge(internals));
    // return svc;
    // }

    // private SyntaxNodes getSyntaxNodes(ServiceNode node) {
    // SyntaxNodes res = new SyntaxNodes();
    // for (OLSyntaxNode ol : node.program().children()) {
    // if (ol instanceof ExecutionInfo)
    // res.setExecutionInfo((ExecutionInfo) ol);
    // else if (ol instanceof CourierDefinitionNode)
    // res.couriers.add((CourierDefinitionNode) ol);
    // else if (ol instanceof EmbedServiceNode) {
    // if (inBlackList(((EmbedServiceNode) ol).serviceName()))
    // continue;
    // res.embeds.add((EmbedServiceNode) ol);
    // } else if (ol instanceof EmbeddedServiceNode) {
    // if (((EmbeddedServiceNode) ol).servicePath().startsWith("joliex.")
    // || ((EmbeddedServiceNode) ol).program() == null)
    // continue;
    // res.internals.add((EmbeddedServiceNode) ol);
    // }
    // }
    // return res;
    // }

    // private String getExectionInfo(SyntaxNodes sn) {
    // String result = "single";
    // if (sn.executionInfo != null)
    // return sn.executionInfo.mode().name().toLowerCase();
    // return result;
    // }

    // private JSONArray getInputPorts(SyntaxNodes sn, ProgramInspector inspector) {
    // JSONArray result = new JSONArray();
    // for (InputPortInfo ipi : inspector.getInputPorts()) {
    // if (inBlackList((ipi.id())))
    // continue;
    // JSONObject entry = new JSONObject(ipi.id());
    // entry.add("protocol", !ipi.protocolId().equals("") ? ipi.protocolId() :
    // "sodep");
    // entry.add("location",
    // ipi.location() != null
    // ? (ipi.location().toString().endsWith("/")
    // ? ipi.location().toString().substring(0, ipi.location().toString().length() -
    // 1)
    // : ipi.location().toString())
    // : "local");

    // JSONArray interfaces = new JSONArray();
    // for (InterfaceDefinition id : ipi.getInterfaceList()) {
    // interfaces.add(new JSONObject(id.name()));
    // }
    // entry.add("interfaces", interfaces);
    // if (ipi.aggregationList() != null && ipi.aggregationList().length > 0)
    // entry.add("aggregates", getAggregates(ipi));
    // if (ipi.redirectionMap() != null && ipi.redirectionMap().size() > 0)
    // entry.add("redirects", getRedirects(ipi));
    // entry.add("couriers", getCouriers(sn));
    // result.add(entry);
    // }
    // return result;
    // }

    // private JSONArray getCouriers(SyntaxNodes sn) {
    // JSONArray result = new JSONArray();
    // for (CourierDefinitionNode cdn : sn.couriers) {
    // CourierChoiceStatement ccs = (CourierChoiceStatement) cdn.body();
    // JSONObject obj = new JSONObject(cdn.inputPortName());

    // if (ccs.interfaceOneWayBranches().size() > 0) {
    // JSONArray iowb = new JSONArray();
    // for (InterfaceOneWayBranch branch : ccs.interfaceOneWayBranches())
    // iowb.add(new JSONObject(branch.interfaceDefinition.name()));
    // obj.add("interfaceOneWay", iowb);
    // }
    // if (ccs.interfaceRequestResponseBranches().size() > 0) {
    // JSONArray iowb = new JSONArray();
    // for (InterfaceRequestResponseBranch branch :
    // ccs.interfaceRequestResponseBranches())
    // iowb.add(new JSONObject(branch.interfaceDefinition.name()));
    // obj.add("interfaceReqRes", iowb);
    // }
    // if (ccs.operationOneWayBranches().size() > 0) {
    // JSONArray iowb = new JSONArray();
    // for (OperationOneWayBranch branch : ccs.operationOneWayBranches())
    // iowb.add(new JSONObject(branch.operation));
    // obj.add("operationOneWay", iowb);
    // }
    // if (ccs.operationRequestResponseBranches().size() > 0) {
    // JSONArray iowb = new JSONArray();
    // for (OperationRequestResponseBranch branch :
    // ccs.operationRequestResponseBranches())
    // iowb.add(new JSONObject(branch.operation));
    // obj.add("operationReqRes", iowb);
    // }
    // result.add(obj);
    // }
    // return result;
    // }

    // private JSONArray getRedirects(InputPortInfo ipi) {
    // JSONArray result = new JSONArray();

    // ipi.redirectionMap().forEach((sid, op) -> {
    // JSONObject obj = new JSONObject(sid);
    // obj.add("port", op);
    // result.add(obj);
    // });

    // return result;
    // }

    // private JSONArray getAggregates(InputPortInfo ipi) {
    // JSONArray result = new JSONArray();
    // for (AggregationItemInfo aii : ipi.aggregationList()) {
    // JSONObject obj = new JSONObject();
    // // collection
    // if (aii.outputPortList().length >= 2) {
    // JSONArray collection = new JSONArray();
    // String name = "";
    // for (String s : aii.outputPortList()) {
    // collection.add(new JSONObject(s));
    // name += s;
    // }
    // obj.add("name", name);
    // obj.add("collection", collection);
    // } else {
    // obj.add("name", aii.outputPortList()[0]);
    // }
    // if (aii.interfaceExtender() != null) {
    // JSONObject extenderO = createInterfaceObject(aii.interfaceExtender());
    // obj.add("extender", extenderO);
    // }
    // result.add(obj);
    // }
    // return result;
    // }

    // private JSONArray getOutputPorts(ProgramInspector inspector) {
    // JSONArray result = new JSONArray();
    // for (OutputPortInfo ipi : inspector.getOutputPorts()) {
    // if (inBlackList((ipi.id())))
    // continue;
    // JSONObject entry = new JSONObject(ipi.id());
    // entry.add("protocol", !ipi.protocolId().equals("") ? ipi.protocolId() :
    // "sodep");
    // entry.add("location",
    // ipi.location() != null
    // ? (ipi.location().toString().endsWith("/")
    // ? ipi.location().toString().substring(0, ipi.location().toString().length() -
    // 1)
    // : ipi.location().toString())
    // : "local");

    // JSONArray interfaces = new JSONArray();
    // for (InterfaceDefinition id : ipi.getInterfaceList()) {
    // interfaces.add(new JSONObject(id.name()));
    // }
    // entry.add("interfaces", interfaces);
    // result.add(entry);
    // }

    // return result;
    // }

    // private JSONArray getEmbeds(SyntaxNodes sn) {
    // JSONArray result = new JSONArray();
    // for (EmbedServiceNode esn : sn.embeds) {
    // JSONObject obj = new JSONObject(esn.serviceName());
    // if (esn.hasBindingPort())
    // obj.add("port", esn.bindingPort().id());
    // obj.add("type", "jolie");
    // result.add(obj);
    // }
    // return result;
    // }

    // private JSONArray getEmbeddings(ProgramInspector ins, Map<String,
    // ProgramInspector> inspectors) {
    // JSONArray result = new JSONArray();
    // for (EmbeddedServiceNode node : ins.getEmbeddedServices()) {
    // if (node.servicePath().startsWith("joliex"))
    // continue;

    // inspectors.forEach((name, i) -> {
    // if (name.equals(node.servicePath().replaceAll(".ol", ""))) {
    // JSONObject obj = new JSONObject(
    // i.getServiceNodes()[0].name().equals("Main") ? name :
    // i.getServiceNodes()[0].name());
    // obj.add("type", node.type().name().toLowerCase());
    // obj.add("port", node.portId());
    // result.add(obj);
    // }
    // });
    // }
    // return result;
    // }

    // private JSONArray getInternals(SyntaxNodes sn) {
    // JSONArray result = new JSONArray();
    // for (EmbeddedServiceNode esn : sn.internals) {
    // JSONObject obj = new JSONObject(esn.servicePath().replaceAll(".ol", ""));
    // obj.add("port", esn.portId());
    // obj.add("type", esn.type() == null ? "jolie" :
    // esn.type().name().toLowerCase());
    // result.add(obj);
    // }
    // return result;
    // }

    // private Map<String, Program> getInternalService(SyntaxNodes sn) {
    // Map<String, Program> res = new HashMap<>();
    // for (EmbeddedServiceNode esn : sn.internals) {
    // res.put(esn.servicePath(), esn.program());
    // }
    // return res;
    // }

    // private ProgramInspector programToInspector(Program p) {
    // ProgramInspectorCreatorVisitor pins = new ProgramInspectorCreatorVisitor(p);
    // return pins.createInspector();
    // }

    private boolean inBlackList(String name) {
        boolean res = false;
        for (String s : blackList)
            if (name.equalsIgnoreCase(s))
                res = true;
        return res;
    }
}
