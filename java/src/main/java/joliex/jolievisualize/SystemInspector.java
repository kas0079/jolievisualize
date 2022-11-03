package joliex.jolievisualize;

import java.util.ArrayList;
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
import jolie.lang.parse.ast.courier.CourierChoiceStatement.InterfaceOneWayBranch;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.InterfaceRequestResponseBranch;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.OperationOneWayBranch;
import jolie.lang.parse.ast.courier.CourierChoiceStatement.OperationRequestResponseBranch;
import jolie.lang.parse.ast.courier.CourierDefinitionNode;
import jolie.lang.parse.ast.expression.ConstantStringExpression;
import jolie.lang.parse.ast.expression.VariableExpressionNode;
import jolie.lang.parse.ast.types.TypeDefinition;
import jolie.lang.parse.ast.types.TypeDefinitionLink;
import jolie.lang.parse.ast.types.TypeInlineDefinition;
import jolie.lang.parse.util.ProgramInspector;
import jolie.util.Pair;
import joliex.jolievisualize.PlaceGraph.Node;
import joliex.jolievisualize.PlaceGraph.Node.NodeType;
import joliex.jolievisualize.System.Aggregate;
import joliex.jolievisualize.System.Courier;
import joliex.jolievisualize.System.InputPort;
import joliex.jolievisualize.System.Interface;
import joliex.jolievisualize.System.JolieSystem;
import joliex.jolievisualize.System.OutputPort;
import joliex.jolievisualize.System.Service;
import joliex.jolievisualize.System.Type;

public class SystemInspector {

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

    private Node initPlaceGraph() {
        // system.placeGraph.addNode("site" + system.placeGraph.getNewSiteNodeID(),
        // NodeType.SITE);
        Node network = system.placeGraph.addNode("network" + system.placeGraph.getNewNetworkNodeID(), NodeType.NETWORK);
        network.addNode("site" + system.placeGraph.getNewSiteNodeID(), NodeType.SITE);
        return network;
    }

    private void dissectInspectors(Map<TopLevelDeploy, Pair<ProgramInspector, JSONObject>> inspectors) {
        Node network = initPlaceGraph();
        inspectors.forEach((tld, ins) -> {
            for (ServiceNode sn : ins.key().getServiceNodes()) {
                Node pgSvcNode = network.addNode(tld.getName(), NodeType.SERVICE);
                pgSvcNode.addNode("site" + system.placeGraph.getNewSiteNodeID(), NodeType.SITE);
                Service s = createService(tld.getName(), sn, ins.key(), ins.value());
                if (!system.listOfServices.contains(s)) {
                    system.listOfServices.add(s);
                }
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

    private boolean inBlackList(String name) {
        boolean res = false;
        for (String s : blackList)
            if (name.equalsIgnoreCase(s))
                res = true;
        return res;
    }
}
