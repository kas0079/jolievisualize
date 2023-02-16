package emilovcina.jolievisualize;

import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.System.Aggregate;
import emilovcina.jolievisualize.System.Courier;
import emilovcina.jolievisualize.System.Docker;
import emilovcina.jolievisualize.System.InputPort;
import emilovcina.jolievisualize.System.Interface;
import emilovcina.jolievisualize.System.JolieSystem;
import emilovcina.jolievisualize.System.OutputPort;
import emilovcina.jolievisualize.System.Service;
import emilovcina.jolievisualize.System.Type;
import jolie.lang.NativeType;
import jolie.lang.parse.ast.EmbedServiceNode;
import jolie.lang.parse.ast.ExecutionInfo;
import jolie.lang.parse.ast.InputPortInfo;
import jolie.lang.parse.ast.InputPortInfo.AggregationItemInfo;
import jolie.lang.parse.ast.InterfaceDefinition;
import jolie.lang.parse.ast.InterfaceExtenderDefinition;
import jolie.lang.parse.ast.OLSyntaxNode;
import jolie.lang.parse.ast.OneWayOperationDeclaration;
import jolie.lang.parse.ast.OperationDeclaration;
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
import jolie.lang.parse.ast.types.TypeChoiceDefinition;
import jolie.lang.parse.ast.types.TypeDefinition;
import jolie.lang.parse.ast.types.TypeDefinitionLink;
import jolie.lang.parse.ast.types.TypeInlineDefinition;
import jolie.lang.parse.context.ParsingContext;
import jolie.util.Pair;

public class SystemInspector {
    private final JolieSystem system;

    public SystemInspector(List<Network> networks) {
        system = new JolieSystem(networks);
    }

    public JSONObject createJSON(String name) {
        return getJolieSystem(name).toJSON();
    }

    public JolieSystem getJolieSystem(String name) {
        system.setName(name);
        inspectNetworks();
        return this.system;
    }

    private void inspectNetworks() {
        system.getNetworks().forEach(n -> {
            inspectServiceNodes(n);
        });
    }

    private void inspectServiceNodes(Network n) {
        n.getNetwork().forEach((tld, pair) -> {
            for (int i = 0; i < tld.getNumberOfInstances(); i++) {
                if (tld.getFilename() == null && tld.getImage() != null)
                    n.addService(createDockerService(tld));
                else {
                    Service svc = createService(pair.key(), pair.value());
                    if (tld.getImage() != null)
                        svc.setImage(tld.getImage());
                    if (tld.getParams() != null)
                        svc.setParamFile(tld.getParams());
                    n.addService(svc);
                }
            }
        });
    }

    private Docker createDockerService(TopLevelDeploy tld) {
        Docker docker = new Docker(system.getNextID());

        docker.setImage(tld.getImage());
        docker.setName(tld.getName());

        if (tld.getPorts() != null && !tld.getPorts().isEmpty())
            tld.getPorts().forEach(port -> {
                int eport = 0;
                int iport = 0;
                if (port.contains(":")) {
                    eport = Integer.parseInt(port.split(":")[0]);
                    iport = Integer.parseInt(port.split(":")[1]);
                } else {
                    eport = Integer.parseInt(port);
                    iport = eport;
                }
                docker.addDockerPort(eport, iport);
            });

        return docker;
    }

    private Service createService(ServiceNode sn, JSONObject params) {
        Service s = new Service(system.getNextID());
        s.setName(sn.name());
        s.addCodeRange(getCodeRange("svc_name", sn.context()));
        s.setUri(getLocalUri(sn.context()));
        for (OLSyntaxNode ol : sn.program().children()) {
            if (ol instanceof ExecutionInfo)
                s.setExectionInfo((ExecutionInfo) ol);
            else if (ol instanceof OutputPortInfo) {
                s.addOutputPort(createOutputPort((OutputPortInfo) ol, params, s));
            } else if (ol instanceof InputPortInfo)
                s.addInputPort(createInputPort((InputPortInfo) ol, params, s));
            else if (ol instanceof CourierDefinitionNode)
                s.addCourier(createCourier((CourierDefinitionNode) ol));
            else if (ol instanceof EmbedServiceNode) {
                EmbedServiceNode esn = ((EmbedServiceNode) ol);
                Service emb = createService(esn.service(), null);
                s.addCodeRange(getEmbedCodeRange(esn));
                emb.setParent(s);
                emb.setBindingPortName(esn.bindingPort().id());
                s.addChild(emb);
                if (emb.getUri() != null)
                    s.addDependencyFile(emb.getUri());
            }
        }
        return s;
    }

    private InputPort createInputPort(InputPortInfo ipi, JSONObject params, Service service) {
        String protocol = "";
        String location = "";
        String annotation = "";
        if (ipi.getDocumentation().isPresent()) {
            String doc = ipi.getDocumentation().get();
            if (doc.startsWith("@jolievisualize"))
                annotation = doc.replaceFirst("@jolievisualize", "");
        }
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
            result.addInterface(createInterface(id, service));
        ipi.operations().forEach((v) -> {
            if (operationExistsInInterface(v))
                return;
            if (v instanceof RequestResponseOperationDeclaration) {
                RequestResponseOperationDeclaration rrd = (RequestResponseOperationDeclaration) v;
                result.addReqResOpersation(rrd);
                addRRType(rrd, service);
            } else if (v instanceof OneWayOperationDeclaration) {
                OneWayOperationDeclaration owod = (OneWayOperationDeclaration) v;
                result.addOneWayOperation(owod);
                addOOType(owod, service);
            }
        });

        if (annotation.length() > 0)
            result.setAnnotation(annotation.trim());
        if (service.getUri() != null && service.getUri().length() > 0) {
            if (ipi.protocol() != null)
                result.addCodeRange(getCodeRange("protocol", ipi.protocol().context()));
            if (ipi.location() != null)
                result.addCodeRange(getCodeRange("location", ipi.location().context()));
            result.addCodeRange(getCodeRange("port", ipi.context()));
        }
        if (ipi.aggregationList() != null && ipi.aggregationList().length > 0)
            for (AggregationItemInfo aii : ipi.aggregationList())
                result.addAggregate(createAggregate(aii, service));

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

    private Aggregate createAggregate(AggregationItemInfo aii, Service svc) {
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
            aggr.setInterfaceExtension(createInterfaceExtender(aii.interfaceExtender(), svc));
        return aggr;
    }

    private Interface createInterfaceExtender(InterfaceExtenderDefinition ied, Service svc) {
        Interface i = createInterface(ied, svc);
        if (ied.defaultRequestResponseOperation() != null) {
            i.addRequestResponse(ied.defaultRequestResponseOperation());
            system.addTypeIfUnique(createType(ied.defaultRequestResponseOperation().requestType(), svc));
            system.addTypeIfUnique(createType(ied.defaultRequestResponseOperation().responseType(), svc));
        }
        if (ied.defaultOneWayOperation() != null) {
            i.addOneWay(ied.defaultOneWayOperation());
            system.addTypeIfUnique(createType(ied.defaultOneWayOperation().requestType(), svc));
        }
        return i;
    }

    private OutputPort createOutputPort(OutputPortInfo opi, JSONObject params, Service service) {
        String protocol = "";
        String location = "";
        String annotation = "";
        if (opi.getDocumentation().isPresent()) {
            String doc = opi.getDocumentation().get();
            if (doc.startsWith("@jolievisualize"))
                annotation = doc.replaceFirst("@jolievisualize", "");
        }
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

        if (annotation.length() > 0)
            op.setAnnotation(annotation.trim());
        if (service.getUri() != null && service.getUri().length() > 0) {
            if (opi.protocol() != null) {
                op.addCodeRange(getCodeRange("protocol", opi.protocol().context()));
            }
            if (opi.location() != null)
                op.addCodeRange(getCodeRange("location", opi.location().context()));
            op.addCodeRange(getCodeRange("port", opi.context()));
        }
        for (InterfaceDefinition id : opi.getInterfaceList())
            op.addInterface(createInterface(id, service));
        opi.operations().forEach((v) -> {
            if (operationExistsInInterface(v))
                return;
            if (v instanceof RequestResponseOperationDeclaration) {
                RequestResponseOperationDeclaration rrd = (RequestResponseOperationDeclaration) v;
                op.addReqResOpersation(rrd);
                addRRType(rrd, service);
            } else if (v instanceof OneWayOperationDeclaration) {
                OneWayOperationDeclaration owod = (OneWayOperationDeclaration) v;
                op.addOneWayOperation(owod);
                addOOType(owod, service);
            }
        });
        return op;
    }

    private Interface createInterface(InterfaceDefinition id, Service svc) {
        Interface result = new Interface(system.getNextInterfaceID(), id.name());
        id.operationsMap().forEach((k, v) -> {
            if (result.getUri() == null)
                result.setUri(getLocalUri(v.context()));
            if (v instanceof RequestResponseOperationDeclaration) {
                RequestResponseOperationDeclaration rrd = (RequestResponseOperationDeclaration) v;
                result.addRequestResponse(rrd);
                addRRType(rrd, svc);
            } else if (v instanceof OneWayOperationDeclaration) {
                OneWayOperationDeclaration owod = (OneWayOperationDeclaration) v;
                result.addOneWay(owod);
                addOOType(owod, svc);
            }
        });
        svc.addDependencyFile(result.getUri());
        return system.addInterfaceIfUnique(result);
    }

    private void addOOType(OneWayOperationDeclaration owod, Service svc) {
        if (!NativeType.isNativeTypeKeyword(owod.requestType().name()))
            system.addTypeIfUnique(createType(owod.requestType(), svc));
    }

    private void addRRType(RequestResponseOperationDeclaration rrd, Service svc) {
        if (!NativeType.isNativeTypeKeyword(rrd.requestType().name()))
            system.addTypeIfUnique(createType(rrd.requestType(), svc));
        if (!NativeType.isNativeTypeKeyword(rrd.responseType().name()))
            system.addTypeIfUnique(createType(rrd.responseType(), svc));
    }

    private Type createType(TypeDefinition td, Service svc) {
        Type type = new Type();
        if (td instanceof TypeDefinitionLink) {
            TypeDefinitionLink tdl = (TypeDefinitionLink) td;
            type.setName(tdl.simpleName());
            type.setType(tdl.linkedType().simpleName());
            type.setUri(getLocalUri(tdl.linkedType().node().context()));
            system.addTypeIfUnique(createType(tdl.linkedType(), svc));
        } else if (td instanceof TypeInlineDefinition) {
            TypeInlineDefinition tid = (TypeInlineDefinition) td;
            type.setName(tid.simpleName());
            type.setType(tid.basicType().nativeType().name().toLowerCase());
            type.setUri(getLocalUri(tid.node().context()));
            if (tid.hasSubTypes()) {
                for (Map.Entry<String, TypeDefinition> entry : tid.subTypes()) {
                    type.addSubType(createType(entry.getValue(), svc));
                }
            }
        } else if (td instanceof TypeChoiceDefinition) {
            TypeChoiceDefinition tcd = (TypeChoiceDefinition) td;
            type.setName(tcd.simpleName());
            type.setUri(getLocalUri(tcd.node().context()));
            Type leftType = createType(tcd.left(), svc);
            Type rightType = createType(tcd.right(), svc);
            type.setLeftType(leftType.getType());
            type.setRightType(rightType.getType());
            return type;
        }
        svc.addDependencyFile(type.getUri());
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

    private boolean operationExistsInInterface(OperationDeclaration od) {
        if (od instanceof RequestResponseOperationDeclaration) {
            RequestResponseOperationDeclaration checkRR = (RequestResponseOperationDeclaration) od;
            for (int i = 0; i < system.getInterfaces().size(); i++) {
                for (int j = 0; j < system.getInterfaces().get(i).getRROperations().size(); j++) {
                    RequestResponseOperationDeclaration rr = system.getInterfaces().get(i).getRROperations().get(j);
                    if (rr.id().equals(checkRR.id()) && rr.requestType().isEquivalentTo(checkRR.requestType())
                            && rr.responseType().isEquivalentTo(checkRR.responseType()))
                        return true;
                }
            }
        } else if (od instanceof OneWayOperationDeclaration) {
            OneWayOperationDeclaration checkOW = (OneWayOperationDeclaration) od;
            for (int i = 0; i < system.getInterfaces().size(); i++) {
                for (int j = 0; j < system.getInterfaces().get(i).getOWOperations().size(); j++) {
                    OneWayOperationDeclaration ow = system.getInterfaces().get(i).getOWOperations().get(j);
                    if (ow.id().equals(checkOW.id()) && ow.requestType().isEquivalentTo(checkOW.requestType()))
                        return true;
                }
            }
        }
        return false;
    }

    private String getLocalUri(ParsingContext pc) {
        String uriString = pc.source().toString();
        String[] parts = uriString.split(system.getName(), 2);
        if (parts.length < 2)
            return "";
        return parts[1];
    }

    private CodeRange getEmbedCodeRange(EmbedServiceNode esn) {
        return new CodeRange("embed_" + esn.serviceName(), esn.bindingPort().context().startLine(),
                esn.bindingPort().context().endLine(), esn.context().startColumn(),
                esn.bindingPort().context().endColumn());
    }

    private CodeRange getCodeRange(String name, ParsingContext context) {
        return new CodeRange(name, context.startLine(), context.endLine(), context.startColumn(), context.endColumn());
    }
}
