package joliex.jolievisualize;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import jolie.Interpreter;
import jolie.JolieURLStreamHandlerFactory;
import jolie.cli.CommandLineException;
import jolie.cli.CommandLineParser;
import jolie.lang.parse.ParserException;
import jolie.lang.parse.module.ModuleException;
import jolie.lang.parse.module.ModuleParsingConfiguration;
import jolie.lang.parse.module.Modules;
import jolie.lang.parse.module.Modules.ModuleParsedResult;
import jolie.lang.parse.util.ParsingUtils;
import jolie.lang.parse.util.ProgramInspector;
import jolie.util.Pair;

public class JolieVisualize {
	static {
		JolieURLStreamHandlerFactory.registerInVM();
	}

	private static Map<TopLevelDeploy, Pair<ProgramInspector, JSONObject>> allProgramInspectors = new HashMap<>();

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
			ModuleException {

		if (args.length <= 6) {
			System.out.println("Invalid arguments, usage: jolievisualize path/to/visualize.json");
			return;
		}

		final String pathName = args[6];

		if (pathName.equals("--help") || pathName.equals("-h")) {
			System.out.println("Usage: ./visualize path/to/visualize.json");
			return;
		}

		Path p = Paths.get(pathName);

		if (p.getFileName().toString().toLowerCase().endsWith(".json")) {
			List<TopLevelDeploy> tlds = getTopLevelDeployment(p);
			for (TopLevelDeploy tld : tlds) {
				Path paramPath;
				if (tld.getParams() != null)
					paramPath = Paths.get(tld.getPath() + "/" + tld.getParams());
				else
					paramPath = null;
				long numInstances = tld.getNumberOfInstances() == 0 ? 1 : tld.getNumberOfInstances();
				for (int i = 0; i < numInstances; i++) {
					TopLevelDeploy tmp = tld.copy();
					allProgramInspectors.put(tmp, new Pair<ProgramInspector, JSONObject>(
							parseFile(tld.getFilename(), tld.getPath(), tld.getName(), args), readParams(paramPath)));
				}
			}

			SystemInspector si = new SystemInspector(allProgramInspectors);
			JSONObject global = si.createJSON(p.getParent().toAbsolutePath().getFileName().toString());
			System.out.println(global.toJSONString());
		} else {
			System.out.println("Invalid - argument must be a .json file");
		}
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

	private static List<TopLevelDeploy> getTopLevelDeployment(Path p)
			throws FileNotFoundException, IOException, ParseException {
		List<TopLevelDeploy> tlds = new ArrayList<>();
		JSONParser parser = new JSONParser();
		try (Reader reader = new FileReader(p.toAbsolutePath().toString())) {
			JSONArray array = (JSONArray) parser.parse(reader);
			for (int i = 0; i < array.size(); i++) {
				TopLevelDeploy tld = new TopLevelDeploy();
				JSONObject o = (JSONObject) array.get(i);
				tld.setPath(p.getParent().toAbsolutePath().toString());
				if (o.get("name") != null)
					tld.setName((String) o.get("name"));
				if (o.get("file") != null)
					tld.setFilename((String) o.get("file"));
				if (o.get("instances") != null)
					tld.setNumberOfInstances((long) o.get("instances"));
				if (o.get("params") != null)
					tld.setParams((String) o.get("params"));
				tlds.add(tld);
			}
		}
		return tlds;
	}

	private static ProgramInspector parseFile(String filePath, String path, String target, String[] args)
			throws CommandLineException, IOException, ParserException, ModuleException {

		List<String> argList = new ArrayList<>();
		for (int i = 0; i < args.length - 1; i++)
			argList.add(args[i]);

		if (target != null) {
			argList.add("-s");
			argList.add(target);
		}
		argList.add(path + "/" + filePath);

		String[] modifiedArgs = new String[argList.size()];
		for (int i = 0; i < argList.size(); i++) {
			modifiedArgs[i] = argList.get(i);
		}

		final CommandLineParser cmdParser = new CommandLineParser(modifiedArgs,
				JolieVisualize.class.getClassLoader());

		Interpreter.Configuration conf = cmdParser.getInterpreterConfiguration();

		ModuleParsingConfiguration mpc = new ModuleParsingConfiguration(
				conf.charset(), conf.includePaths(),
				conf.packagePaths(), conf.jolieClassLoader(), conf.constants(), false);

		ModuleParsedResult mpr = Modules.parseModule(mpc, conf.inputStream(),
				conf.programFilepath().toURI());

		ProgramInspector inspector = ParsingUtils.createInspector(mpr.mainProgram());
		cmdParser.close();
		return inspector;
	}
}
