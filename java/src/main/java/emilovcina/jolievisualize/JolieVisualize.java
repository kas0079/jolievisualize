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

        boolean shouldGenerateDeployment = false;
        String deploymentType = "";

        for (int i = 6; i < args.length; i++) {
            if (args[i].equals("--docker-compose")) {
                shouldGenerateDeployment = true;
                deploymentType = "docker_compose";
            }
        }

        Path p = Paths.get(pathName);

        if (!shouldGenerateDeployment) {
            List<Network> networks = generateVisualizeJSON(p, args);
            networks.forEach(network -> network.getServices()
                    .forEach(s -> s.getDependencies().forEach(d -> System.out.println(d))));
        } else {
            switch (deploymentType) {
                case "docker_compose":
                    // DockerCompose dc = new DockerCompose(
                    // si.getJolieSystem(p.getParent().toAbsolutePath().getFileName().toString()));
                    // System.out.println(dc.generateComposeFile());
                    break;
                case "kubernetes":
                    // Not implemented
                    break;
                default:
                    break;
            }
            // create build folder
            // Build build = new Build(listOfNetworks);
        }
    }

    private static List<Network> generateVisualizeJSON(Path p, String[] args) throws FileNotFoundException, IOException,
            ParseException, ParserException, ModuleException, CommandLineException, CodeCheckException {
        final List<Network> listOfNetworks = new ArrayList<>();
        if (p.getFileName().toString().toLowerCase().endsWith(".json")) {
            List<List<TopLevelDeploy>> tlds = getTopLevelDeployment(p);
            for (List<TopLevelDeploy> tldList : tlds) {
                Network n = new Network();
                for (TopLevelDeploy tld : tldList) {
                    JSONObject params = null;
                    if (tld.getParams() != null)
                        params = readParams(Paths.get(tld.getPath() + "/" + tld.getParams()));
                    if (tld.getFilename() == null) {
                        n.addNetwork(tld, null, null);
                        continue;
                    }
                    for (ServiceNode sn : parseFile(tld.getFilename(), tld.getPath(), args)) {
                        if (tld.getName() != null) {
                            if (tld.getName().equals(sn.name()))
                                n.addNetwork(tld, sn, params);
                        } else
                            n.addNetwork(tld, sn, params);
                    }
                }
                listOfNetworks.add(n);
            }
            SystemInspector si = new SystemInspector(listOfNetworks);
            JSONObject o = si.createJSON(p.getParent().toAbsolutePath().getFileName().toString());
            System.out.println(o.toJSONString());
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
                    if (o.get("params") != null)
                        tld.setParams((String) o.get("params"));
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
                conf.packagePaths(), conf.jolieClassLoader(), conf.constants(), true);

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
