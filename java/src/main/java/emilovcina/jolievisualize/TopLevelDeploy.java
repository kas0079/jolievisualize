package emilovcina.jolievisualize;

import java.util.ArrayList;
import java.util.List;

public class TopLevelDeploy {
    private String name;
    private long instances;
    private String file;
    private String params;
    private String path;

    private String image;
    private List<String> ports = new ArrayList<>();

    public TopLevelDeploy() {
        this.instances = 1;
    }

    public TopLevelDeploy(String name) {
        this.name = name;
        this.instances = 1;
    }

    public TopLevelDeploy copy() {
        TopLevelDeploy res = new TopLevelDeploy();
        res.name = this.name;
        res.instances = this.instances;
        res.file = this.file;
        res.params = this.params;
        res.path = this.path;

        res.image = this.image;
        this.ports.forEach((p) -> res.ports.add(p));
        return res;
    }

    public String getImage() {
        return this.image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<String> getPorts() {
        return this.ports;
    }

    public void addPort(String port) {
        this.ports.add(port);
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
