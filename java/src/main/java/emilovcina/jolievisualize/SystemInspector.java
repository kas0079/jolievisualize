package emilovcina.jolievisualize;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;

import emilovcina.jolievisualize.System.Aggregate;
import emilovcina.jolievisualize.System.Courier;
import emilovcina.jolievisualize.System.Docker;
import emilovcina.jolievisualize.System.InputPort;
import emilovcina.jolievisualize.System.Interface;
import emilovcina.jolievisualize.System.JolieSystem;
import emilovcina.jolievisualize.System.Network;
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

    public SystemInspector(List<Network> networks, Path visFilePath) {
        system = new JolieSystem(networks, visFilePath);
    }

    /**
     * Creates a JSON Object based on the jolie system
     * 
     * @param name name of the system
     * @return Json object of the system
     */
    public JSONObject createJSON(String name) {
        return getJolieSystem(name).toJSON();
    }

    /**
     * Goes through the system and gets all the information.
     * 
     * @param name name of the system
     * @return JolieSystem containing all needed information.
     */
    public JolieSystem getJolieSystem(String name) {
        system.setName(name);
        inspectNetworks();
        return this.system;
    }

    /**
     * Goes through all networks and inspects the service nodes.
     */
    private void inspectNetworks() {
        system.getNetworks().forEach(n -> {
            inspectServiceNodes(n);
        });
    }

    /**
     * Creates Service objects from Jolie service nodes
     * Also handles Docker services
     */
    private void inspectServiceNodes(Network n) {
        n.getNetwork().forEach((tld, sn) -> {
            for (int i = 0; i < tld.getNumberOfInstances(); i++) {
                if (tld.getFilename() == null && tld.getImage() != null)
                    n.addService(createDockerService(tld));
                else {
                    Service svc = createService(sn, tld.getParamJSON());
                    addDockerPorts(tld, svc);
                    if (tld.getImage() != null)
                        svc.setImage(tld.getImage());
                    if (tld.getParams() != null)
                        svc.setParamFile(tld.getParams());
                    if (tld.getArgs() != null)
                        svc.setArgs(tld.getArgs());
                    if (tld.getContainerName() != null)
                        svc.setContainerName(tld.getContainerName());
                    if (tld.getEnvJSON() != null)
                        svc.setEnvJSON(tld.getEnvJSON());
                    if (tld.getVolumes().size() > 0)
                        for (String conf : tld.getVolumes())
                            svc.addVolume(conf);
                    n.addService(svc);
                }
            }
        });
    }

    /**
     * Helper method to create docker service
     * 
     * @param tld Top Level deployment of the docker service
     * @return Docker service
     */
    private Docker createDockerService(TopLevelDeploy tld) {
        Docker docker = new Docker(system.getNextID());
        docker.setImage(tld.getImage());
        docker.setName(tld.getName());
        if (tld.getContainerName() != null)
            docker.setContainerName(tld.getContainerName());
        addDockerPorts(tld, docker);
        return docker;
    }

    /**
     * Adds ports defined in the top level deployment to the (docker) service
     * 
     * @param tld Top Level deploymen
     * @param s   (Docker) Service
     */
    private void addDockerPorts(TopLevelDeploy tld, Service s) {
        if (tld.getPorts() == null || tld.getPorts().isEmpty())
            return;
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
            s.addDockerPort(eport, iport);
        });
    }

    /**
     * Goes through the OLSyntaxNodes and gets the relevant nodes and creates
     * corresponding objects.
     * 
     * @param sn     ServiceNode
     * @param params JSON params
     * @return Service Object
     */
    private Service createService(ServiceNode sn, JSONObject params) {
        Service s = new Service(system.getNextID());
        s.setName(sn.name());
        s.addCodeRange(getCodeRange("svc_name", sn.context()));
        s.setUri(getLocalUri(sn.context()));
        s.setParamJSON(params);
        for (OLSyntaxNode ol : sn.program().children()) {
            if (ol instanceof ExecutionInfo)
                s.setExectionInfo((ExecutionInfo) ol);
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
        for (OLSyntaxNode ol : sn.program().children()) {
            if (ol instanceof OutputPortInfo) {
                s.addOutputPort(createOutputPort((OutputPortInfo) ol, s));
            } else if (ol instanceof InputPortInfo)
                s.addInputPort(createInputPort((InputPortInfo) ol, s));
        }
        return s;
    }

    /**
     * Parses the input port info and creates the corresponding input port object.
     *
     * @param ipi     InputPortInfo from the Jolie Parser
     * @param service Service to add the port to, used for keeping track of
     *                dependencies
     * @return InputPort object
     */
    private InputPort createInputPort(InputPortInfo ipi, Service service) {
        String protocol = "";
        String location = "";
        String annotation = "";
        CodeRange locationRange = null;
        CodeRange protocolRange = null;
        if (ipi.getDocumentation().isPresent()) {
            String doc = ipi.getDocumentation().get();
            if (doc.startsWith("@jolievisualize"))
                annotation = doc.replaceFirst("@jolievisualize", "");
        }
        if (ipi.protocol() instanceof VariableExpressionNode) {
            Pair<String, ConstantStringExpression> t = getParamFromPath(
                    ((VariableExpressionNode) ipi.protocol()).variablePath(), service.getParamJSON());
            if (t != null) {
                protocol = t.key();
                protocolRange = getCodeRange("protocol", t.value().context());
            } else
                protocol = !ipi.protocolId().equals("") ? ipi.protocolId() : "sodep";
        } else
            protocol = !ipi.protocolId().equals("") ? ipi.protocolId() : "sodep";

        if (ipi.location() == null)
            location = "local";
        else {
            if (ipi.location() instanceof VariableExpressionNode) {
                Pair<String, ConstantStringExpression> t = getParamFromPath(
                        ((VariableExpressionNode) ipi.location()).variablePath(), service.getParamJSON());
                if (t != null) {
                    location = t.key();
                    locationRange = getCodeRange("location", t.value().context());
                }
            } else
                location = (ipi.location().toString().endsWith("/")
                        ? ipi.location().toString().substring(0, ipi.location().toString().length() - 1)
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
            if (protocolRange != null)
                result.addCodeRange(protocolRange);
            else if (ipi.protocol() != null)
                result.addCodeRange(getCodeRange("protocol", ipi.protocol().context()));

            if (locationRange != null)
                result.addCodeRange(locationRange);
            else if (ipi.location() != null)
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

    /**
     * Parses the courier node into the corresponding object
     *
     * @param cdn Courier Node
     * @return Courier object
     */
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

    /**
     * Parses the aggregation info from an input port node and creates the
     * corresponding object
     * also adds any interface extenders to the service.
     * 
     * @param aii Aggregation Info Node
     * @param svc Service, used for keeping track of dependencies
     * @return Courier object
     */
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

    /**
     * Parses interface extender node and creates an Interface object
     * 
     * @param ied InterfaceExtender Node
     * @param svc Service, used for keeping track of dependencies
     * @return Interface object
     */
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

    /**
     * Parses the output port info and creates the corresponding output port object.
     * 
     * @param opi     OutputportInro node from the Jolie Parser
     * @param service Service to add the port to, used for keeping track of
     *                dependencies
     * @return OutputPort object
     */
    private OutputPort createOutputPort(OutputPortInfo opi, Service service) {
        String protocol = "";
        String location = "";
        String annotation = "";
        CodeRange locationRange = null;
        CodeRange protocolRange = null;
        if (opi.getDocumentation().isPresent()) {
            String doc = opi.getDocumentation().get();
            if (doc.startsWith("@jolievisualize"))
                annotation = doc.replaceFirst("@jolievisualize", "");
        }
        if (opi.protocol() instanceof VariableExpressionNode) {
            Pair<String, ConstantStringExpression> t = getParamFromPath(
                    ((VariableExpressionNode) opi.protocol()).variablePath(), service.getParamJSON());
            if (t != null) {
                protocol = t.key();
                protocolRange = getCodeRange("protocol", t.value().context());
            } else
                protocol = !opi.protocolId().equals("") ? opi.protocolId() : "sodep";

        } else
            protocol = !opi.protocolId().equals("") ? opi.protocolId() : "sodep";

        if (opi.location() == null)
            location = "local";
        else {
            if (opi.location() instanceof VariableExpressionNode) {
                Pair<String, ConstantStringExpression> t = getParamFromPath(
                        ((VariableExpressionNode) opi.location()).variablePath(), service.getParamJSON());
                if (t != null) {
                    location = t.key();
                    locationRange = getCodeRange("location", t.value().context());
                }
            } else
                location = (opi.location().toString().endsWith("/")
                        ? opi.location().toString().substring(0, opi.location().toString().length() - 1)
                        : opi.location().toString());
        }

        OutputPort op = new OutputPort(opi.id(), protocol, location);

        if (annotation.length() > 0)
            op.setAnnotation(annotation.trim());
        if (service.getUri() != null && service.getUri().length() > 0) {
            if (protocolRange != null)
                op.addCodeRange(protocolRange);
            else if (opi.protocol() != null)
                op.addCodeRange(getCodeRange("protocol", opi.protocol().context()));

            if (locationRange != null)
                op.addCodeRange(locationRange);
            else if (opi.location() != null)
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

    /**
     * Parses interface definitions and creates the corresponding Interface object
     *
     * @param id  Interface Definition Node
     * @param svc Service using the interface, used for keeping track of
     *            dependencies
     * @return
     */
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

    /**
     * Adds OneWay operation declaration to the global system
     * 
     * @param owod OneWay declaration
     * @param svc  Service ref, used for keeping track of dependencies
     */
    private void addOOType(OneWayOperationDeclaration owod, Service svc) {
        if (!NativeType.isNativeTypeKeyword(owod.requestType().name()))
            system.addTypeIfUnique(createType(owod.requestType(), svc));
    }

    /**
     * Adds ReqRes operation declaration to the global system
     * 
     * @param rrd ReqRes declaration
     * @param svc Service ref, used for keeping track of dependencies
     */
    private void addRRType(RequestResponseOperationDeclaration rrd, Service svc) {
        if (!NativeType.isNativeTypeKeyword(rrd.requestType().name()))
            system.addTypeIfUnique(createType(rrd.requestType(), svc));
        if (!NativeType.isNativeTypeKeyword(rrd.responseType().name()))
            system.addTypeIfUnique(createType(rrd.responseType(), svc));
    }

    /**
     * Parses type definition node and creates the corrosponding type object
     * 
     * @param td  TypeDefinition Node
     * @param svc Service ref, used for keeping track of dependencies
     * @return Type object
     */
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

    /**
     * Gets the value of a parameter in code by looking at the params parsed in with
     * the service.
     * 
     * @param vpn    VariaplePathNode
     * @param params JSON parameters
     * @return Pair where the string is the param name and the corrosponding
     *         ConstantStringExpression.
     */
    private Pair<String, ConstantStringExpression> getParamFromPath(VariablePathNode vpn, JSONObject params) {
        Object obj = null;
        ConstantStringExpression cres = null;
        for (int i = 1; i < vpn.path().size(); i++) {
            Pair<OLSyntaxNode, OLSyntaxNode> o = vpn.path().get(i);
            if (o.key() != null) {
                cres = (ConstantStringExpression) o.key();
                obj = params.get(cres.value());
            }
        }
        if (obj instanceof String)
            return new Pair<String, ConstantStringExpression>((String) obj, cres);
        return null;
    }

    /**
     * Checks if operation already is defined in an interface.
     * 
     * @param od Operation Declaration
     * @return true if any interface in the system has the operation.
     */
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

    /**
     * Parses the URI from the parsing context to a string path relative to the
     * visualize json file
     * 
     * @param pc Parsing Context containing the source
     * @return String of the relative path.
     */
    private String getLocalUri(ParsingContext pc) {
        String uriString = pc.source().toString();
        String[] parts = uriString.split(system.getName(), 2);
        if (parts.length < 2)
            return "";
        return parts[1];
    }

    /**
     * Gets the range of the embedServiceNode using the parsing context.
     * 
     * @param esn Embed Service Node
     * @return CodeRange which spans over the embed line in the code.
     */
    private CodeRange getEmbedCodeRange(EmbedServiceNode esn) {
        return new CodeRange("embed_" + esn.serviceName(), esn.bindingPort().context().startLine(),
                esn.bindingPort().context().endLine(), esn.context().startColumn(),
                esn.bindingPort().context().endColumn());
    }

    /**
     * Gets the range of code using the parsing context
     * 
     * @param name    Name of the code range
     * @param context Parsing Context
     * @return CodeRange which spans over the parsing context
     */
    private CodeRange getCodeRange(String name, ParsingContext context) {
        return new CodeRange(name, context.startLine(), context.endLine(), context.startColumn(), context.endColumn());
    }
}
