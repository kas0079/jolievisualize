package joliex.jolievisualize;

import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import jolie.lang.NativeType;
import jolie.lang.parse.ast.EmbedServiceNode;
import jolie.lang.parse.ast.ExecutionInfo;
import jolie.lang.parse.ast.InputPortInfo;
import jolie.lang.parse.ast.InputPortInfo.AggregationItemInfo;
import jolie.lang.parse.ast.InterfaceDefinition;
import jolie.lang.parse.ast.InterfaceExtenderDefinition;
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
import jolie.util.Pair;
import joliex.jolievisualize.System.Aggregate;
import joliex.jolievisualize.System.Courier;
import joliex.jolievisualize.System.InputPort;
import joliex.jolievisualize.System.Interface;
import joliex.jolievisualize.System.JolieSystem;
import joliex.jolievisualize.System.OutputPort;
import joliex.jolievisualize.System.Service;
import joliex.jolievisualize.System.Type;

public class SystemInspector {
    private final JolieSystem system;

    public SystemInspector(List<Network> networks) {
        system = new JolieSystem(networks);
    }

    public JSONObject createJSON(String name) {
        system.setName(name);
        inspectNetworks();
        return system.toJSON();
    }

    private void inspectNetworks() {
        system.getNetworks().forEach(n -> {
            inspectServiceNodes(n);
        });
    }

    private void inspectServiceNodes(Network n) {
        n.getNetwork().forEach((tld, pair) -> {
            for (int i = 0; i < tld.getNumberOfInstances(); i++) {
                Service svc = createService(pair.key(), pair.value());
                n.addService(svc);
            }
        });
    }

    private Service createService(ServiceNode sn, JSONObject params) {
        Service s = new Service(system.getNextID());
        s.setName(sn.name());
        for (OLSyntaxNode ol : sn.program().children()) {
            if (ol instanceof ExecutionInfo)
                s.setExectionInfo((ExecutionInfo) ol);
            if (ol instanceof OutputPortInfo)
                s.addOutputPort(createOutputPort((OutputPortInfo) ol, params));
            if (ol instanceof InputPortInfo)
                s.addInputPort(createInputPort((InputPortInfo) ol, params, s));
            if (ol instanceof CourierDefinitionNode)
                s.addCourier(createCourier((CourierDefinitionNode) ol));
            if (ol instanceof EmbedServiceNode) {
                Service emb = createService(((EmbedServiceNode) ol).service(), null);
                emb.setParent(s);
                s.addChild(emb);
            }
        }
        return s;
    }

    private InputPort createInputPort(InputPortInfo ipi, JSONObject params, Service service) {
        String protocol = "";
        String location = "";
        if (ipi.protocol() instanceof VariableExpressionNode) {
            String t = getParamFromPath(((VariableExpressionNode) ipi.protocol()).variablePath(), params);
            if (!t.equals(""))
                protocol = t;
            else
                protocol = !ipi.protocolId().equals("") ? ipi.protocolId() : "sodep";
        } else
            protocol = !ipi.protocolId().equals("") ? ipi.protocolId() : "sodep";

        if (ipi.location() == null)
            location = "local";
        else {
            if (ipi.location() instanceof VariableExpressionNode) {
                String t = getParamFromPath(((VariableExpressionNode) ipi.location()).variablePath(), params);
                if (!t.equals(""))
                    location = t;
            } else
                location = (ipi.location().toString().endsWith("/")
                        ? ipi.location().toString().substring(0, ipi.location().toString().length() -
                                1)
                        : ipi.location().toString());
        }

        InputPort result = new InputPort(ipi.id(), protocol, location);
        for (InterfaceDefinition id : ipi.getInterfaceList())
            result.addInterface(createInterface(id));

        if (ipi.aggregationList() != null && ipi.aggregationList().length > 0)
            for (AggregationItemInfo aii : ipi.aggregationList())
                result.addAggregate(createAggregate(aii));

        if (ipi.redirectionMap() != null && ipi.redirectionMap().size() > 0)
            ipi.redirectionMap().forEach((sid, op) -> {
                result.addRedirect(sid, op);
            });

        for (Courier c : service.getCouriers())
            if (c.getName().equals(ipi.id()))
                result.addCourier(c);

        return result;
    }

    private Courier createCourier(CourierDefinitionNode cdn) {
        Courier cou = new Courier(cdn.inputPortName());
        CourierChoiceStatement ccs = (CourierChoiceStatement) cdn.body();
        if (ccs.interfaceOneWayBranches().size() > 0)
            for (InterfaceOneWayBranch branch : ccs.interfaceOneWayBranches())
                cou.addInterfaceOneWay(branch.interfaceDefinition.name());
        if (ccs.interfaceRequestResponseBranches().size() > 0)
            for (InterfaceRequestResponseBranch branch : ccs.interfaceRequestResponseBranches())
                cou.addInterfaceReqRes(branch.interfaceDefinition.name());
        if (ccs.operationOneWayBranches().size() > 0)
            for (OperationOneWayBranch branch : ccs.operationOneWayBranches())
                cou.addOperationOneWay(branch.operation);
        if (ccs.operationRequestResponseBranches().size() > 0)
            for (OperationRequestResponseBranch branch : ccs.operationRequestResponseBranches())
                cou.addOperationReqRes(branch.operation);
        return cou;
    }

    private Aggregate createAggregate(AggregationItemInfo aii) {
        Aggregate aggr = new Aggregate();
        // Collection
        if (aii.outputPortList().length >= 2) {
            String name = "";
            for (String s : aii.outputPortList()) {
                aggr.addCollection(s);
                name += s;
            }
            aggr.setName(name);
        } else
            aggr.setName(aii.outputPortList()[0]);
        // Interface extender
        if (aii.interfaceExtender() != null)
            aggr.setInterfaceExtension(createInterfaceExtender(aii.interfaceExtender()));
        return aggr;
    }

    private Interface createInterfaceExtender(InterfaceExtenderDefinition ied) {
        Interface i = createInterface(ied);
        if (ied.defaultRequestResponseOperation() != null) {
            i.addRequestResponse(ied.defaultRequestResponseOperation());
            system.addTypeIfUnique(createType(ied.defaultRequestResponseOperation().requestType()));
            system.addTypeIfUnique(createType(ied.defaultRequestResponseOperation().responseType()));
        }
        if (ied.defaultOneWayOperation() != null) {
            i.addOneWay(ied.defaultOneWayOperation());
            system.addTypeIfUnique(createType(ied.defaultOneWayOperation().requestType()));
        }
        return i;
    }

    private OutputPort createOutputPort(OutputPortInfo opi, JSONObject params) {
        String protocol = "";
        String location = "";
        if (opi.protocol() instanceof VariableExpressionNode) {
            String t = getParamFromPath(((VariableExpressionNode) opi.protocol()).variablePath(), params);
            if (!t.equals(""))
                protocol = t;
            else
                protocol = !opi.protocolId().equals("") ? opi.protocolId() : "sodep";
        } else
            protocol = !opi.protocolId().equals("") ? opi.protocolId() : "sodep";

        if (opi.location() == null)
            location = "local";
        else {
            if (opi.location() instanceof VariableExpressionNode) {
                String t = getParamFromPath(((VariableExpressionNode) opi.location()).variablePath(), params);
                if (!t.equals(""))
                    location = t;
            } else
                location = (opi.location().toString().endsWith("/")
                        ? opi.location().toString().substring(0, opi.location().toString().length() -
                                1)
                        : opi.location().toString());
        }
        OutputPort op = new OutputPort(opi.id(), protocol, location);
        for (InterfaceDefinition id : opi.getInterfaceList())
            op.addInterface(createInterface(id));
        return op;
    }

    private Interface createInterface(InterfaceDefinition id) {
        Interface result = new Interface(system.getNextInterfaceID(), id.name());
        id.operationsMap().forEach((k, v) -> {
            if (v instanceof RequestResponseOperationDeclaration) {
                RequestResponseOperationDeclaration rrd = (RequestResponseOperationDeclaration) v;
                result.addRequestResponse(rrd);
                if (!NativeType.isNativeTypeKeyword(rrd.requestType().name()))
                    system.addTypeIfUnique(createType(rrd.requestType()));
                if (!NativeType.isNativeTypeKeyword(rrd.responseType().name()))
                    system.addTypeIfUnique(createType(rrd.responseType()));
            } else if (v instanceof OneWayOperationDeclaration) {
                OneWayOperationDeclaration owod = (OneWayOperationDeclaration) v;
                result.addOneWay(owod);
                if (!NativeType.isNativeTypeKeyword(owod.requestType().name()))
                    system.addTypeIfUnique(createType(owod.requestType()));
            }
        });
        return system.addInterfaceIfUnique(result);
    }

    private Type createType(TypeDefinition td) {
        Type type = new Type(td.name());
        if (td instanceof TypeDefinitionLink) {
            TypeDefinitionLink tdl = (TypeDefinitionLink) td;
            type.setTypeName(tdl.linkedTypeName());
        } else if (td instanceof TypeInlineDefinition) {
            TypeInlineDefinition tid = (TypeInlineDefinition) td;
            type.setTypeName(tid.basicType().nativeType().name().toLowerCase());
            if (tid.hasSubTypes())
                for (Map.Entry<String, TypeDefinition> entry : tid.subTypes())
                    type.addSubType(createType(entry.getValue()));
        }
        return type;
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

}
