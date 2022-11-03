package joliex.jolievisualize;

public class TopLevelDeploy {
	private String name;
	private long instances;
	private String file;
	private String params;
	private String path;

	public TopLevelDeploy() {
	}

	public TopLevelDeploy(String name) {
		this.name = name;
	}

	public TopLevelDeploy copy() {
		TopLevelDeploy res = new TopLevelDeploy();
		res.name = this.name;
		res.instances = this.instances;
		res.file = this.file;
		res.params = this.params;
		res.path = this.path;
		return res;
	}

	public String getPath() {
		return this.path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getFilename() {
		return this.file;
	}

	public void setFilename(String filename) {
		this.file = filename;
	}

	public long getNumberOfInstances() {
		return this.instances;
	}

	public void setNumberOfInstances(long number) {
		this.instances = number;
	}

	public String getParams() {
		return this.params;
	}

	public void setParams(String params) {
		this.params = params;
	}
}
