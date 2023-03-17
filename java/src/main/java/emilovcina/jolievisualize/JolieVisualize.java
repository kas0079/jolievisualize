package emilovcina.jolievisualize;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import emilovcina.jolievisualize.Deployment.Build;
import emilovcina.jolievisualize.Deployment.Build.BuildMethod;
import emilovcina.jolievisualize.System.Network;
import jolie.Interpreter;
import jolie.JolieURLStreamHandlerFactory;
import jolie.cli.CommandLineException;
import jolie.cli.CommandLineParser;
import jolie.lang.CodeCheckException;
import jolie.lang.parse.ParserException;
import jolie.lang.parse.ast.OLSyntaxNode;
import jolie.lang.parse.ast.ServiceNode;
import jolie.lang.parse.module.ModuleException;
import jolie.lang.parse.module.ModuleParsingConfiguration;
import jolie.lang.parse.module.Modules;
import jolie.lang.parse.module.Modules.ModuleParsedResult;

public class JolieVisualize {
    static {
        JolieURLStreamHandlerFactory.registerInVM();
    }

    /**
     * @param args the command line arguments
     * @throws IOException
     * @throws FileNotFoundException
     * @throws ParseException
     * @throws CommandLineException
     * @throws ModuleException
     * @throws ParserException
     */
    public static void main(String[] args)
            throws FileNotFoundException, IOException, ParseException, CommandLineException, ParserException,
            ModuleException, CodeCheckException {

        if (args.length <= 6) {
            System.out.println("Invalid arguments, usage: ./visualize path/to/visualize.json");
            return;
        }

        final String pathName = args[6];

        if (pathName.equals("--help") || pathName.equals("-h")) {
            System.out.println("Usage: ./visualize path/to/visualize.json");
            return;
        }

        BuildMethod deploymentType = null;
        String buildFolder = null;

        for (int i = 6; i < args.length; i++) {
            if (args[i].equals("--docker-compose"))
                deploymentType = BuildMethod.DOCKER_COMPOSE;
            if (args[i].equals("--kubernetes"))
                deploymentType = BuildMethod.KUBERNETES;
            if (args[i].equals("--build"))
                buildFolder = args[i + 1];
        }

        Path p = Paths.get(pathName);

        SystemInspector si = new SystemInspector(parseNetworks(p, args), p);

        if (deploymentType == null) {
            JSONObject o = si.createJSON(p.getParent().toAbsolutePath().getFileName().toString());
            System.out.println(o.toJSONString());
        } else {
            System.out.println(
                    new Build(si.getJolieSystem(p.getParent().toAbsolutePath().getFileName().toString()),
                            deploymentType, buildFolder).toJSON().toJSONString());
        }
    }

    private static List<Network> parseNetworks(Path p, String[] args) throws FileNotFoundException, IOException,
            ParseException, ParserException, ModuleException, CommandLineException, CodeCheckException {
        final List<Network> listOfNetworks = new ArrayList<>();
        if (p.getFileName().toString().toLowerCase().endsWith(".json")) {
            List<List<TopLevelDeploy>> tlds = getTopLevelDeployment(p);
            for (List<TopLevelDeploy> tldList : tlds) {
                Network n = new Network();
                for (TopLevelDeploy tld : tldList) {
                    if (tld.getParams() != null && tld.getParamJSON() == null) {
                        tld.setParamJSON(readParams(Paths.get(tld.getPath() + "/" + tld.getParams())));
                    }
                    if (tld.getFilename() == null) {
                        n.addNetwork(tld, null);
                        continue;
                    }
                    for (ServiceNode sn : parseFile(tld.getFilename(), tld.getPath(), args)) {
                        if (tld.getName() != null) {
                            if (tld.getName().equals(sn.name()))
                                n.addNetwork(tld, sn);
                        } else
                            n.addNetwork(tld, sn);
                    }
                }
                listOfNetworks.add(n);
            }
        } else {
            System.out.println("Invalid - argument must be a .json file");
        }
        return listOfNetworks;
    }

    private static JSONObject readParams(Path params) {
        if (params == null)
            return null;
        JSONParser parser = new JSONParser();
        try (Reader reader = new FileReader(params.toAbsolutePath().toString())) {
            JSONObject obj = (JSONObject) parser.parse(reader);
            return obj;
        } catch (IOException | ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    private static List<List<TopLevelDeploy>> getTopLevelDeployment(Path p)
            throws FileNotFoundException, IOException, ParseException {
        List<List<TopLevelDeploy>> tlds = new ArrayList<>();
        JSONParser parser = new JSONParser();
        try (Reader reader = new FileReader(p.toAbsolutePath().toString())) {
            JSONArray array = (JSONArray) parser.parse(reader);
            for (int i = 0; i < array.size(); i++) {
                JSONArray tmp = (JSONArray) array.get(i);
                List<TopLevelDeploy> tmpList = new ArrayList<>();
                for (int j = 0; j < tmp.size(); j++) {
                    TopLevelDeploy tld = new TopLevelDeploy();
                    JSONObject o = (JSONObject) tmp.get(j);
                    tld.setPath(p.getParent().toAbsolutePath().toString());
                    if (o.get("target") != null)
                        tld.setName((String) o.get("target"));
                    if (o.get("name") != null)
                        tld.setName((String) o.get("name"));
                    if (o.get("file") != null)
                        tld.setFilename((String) o.get("file"));
                    if (o.get("instances") != null)
                        tld.setNumberOfInstances((long) o.get("instances"));
                    if (o.get("container") != null)
                        tld.setContainerName((String) o.get("container"));
                    if (o.get("args") != null)
                        tld.setArgs((String) o.get("args"));
                    if (o.get("params") != null) {
                        if (o.get("params") instanceof String)
                            tld.setParams((String) o.get("params"));
                        else if (o.get("params") instanceof JSONObject)
                            tld.setParamJSON((JSONObject) o.get("params"));
                    }
                    if (o.get("env") != null)
                        if (o.get("env") instanceof JSONObject)
                            tld.setEnvJSON((JSONObject) o.get("env"));
                    if (o.get("volumes") != null)
                        for (Object s : ((JSONArray) o.get("volumes")))
                            tld.addVolume((String) s);
                    if (o.get("image") != null)
                        tld.setImage((String) o.get("image"));
                    if (o.get("ports") != null)
                        for (Object s : ((JSONArray) o.get("ports")))
                            tld.addPort((String) s);
                    tmpList.add(tld);
                }
                tlds.add(tmpList);
            }
        }
        return tlds;
    }

    private static List<ServiceNode> parseFile(String filePath, String path, String[] args)
            throws CommandLineException, IOException, ParserException, ModuleException, CodeCheckException {
        List<String> argList = new ArrayList<>();
        for (int i = 0; i < 6; i++)
            argList.add(args[i]);

        argList.add(path + "/" + filePath);

        String[] modifiedArgs = new String[argList.size()];
        for (int i = 0; i < argList.size(); i++)
            modifiedArgs[i] = argList.get(i);

        final CommandLineParser cmdParser = new CommandLineParser(modifiedArgs,
                JolieVisualize.class.getClassLoader());

        Interpreter.Configuration conf = cmdParser.getInterpreterConfiguration();

        ModuleParsingConfiguration mpc = new ModuleParsingConfiguration(
                conf.charset(), conf.includePaths(),
                conf.packagePaths(), conf.jolieClassLoader(), conf.constants(), true, false);

        ModuleParsedResult mpr = Modules.parseModule(mpc, conf.inputStream(),
                conf.programFilepath().toURI());

        List<ServiceNode> res = new ArrayList<>();
        for (OLSyntaxNode ol : mpr.mainProgram().children()) {
            if (ol instanceof ServiceNode)
                res.add((ServiceNode) ol);
        }

        cmdParser.close();
        return res;
    }
}
