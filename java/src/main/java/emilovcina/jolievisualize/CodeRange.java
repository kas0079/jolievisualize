package emilovcina.jolievisualize;

import java.util.HashMap;
import java.util.Map;

import org.json.simple.JSONObject;

public class CodeRange {
    private int startLineNumber;
    private int endLineNumber;
    private int startCharacter;
    private int endCharacter;
    private String name;

    public CodeRange(String name, int startLineNumber, int endLineNumber, int startCharacter, int endCharacter) {
        this.startLineNumber = startLineNumber;
        this.endLineNumber = endLineNumber;
        this.startCharacter = startCharacter;
        this.endCharacter = endCharacter;
        this.name = name;
    }

    /**
     * Makes this class into a JSON object
     * 
     * @return JSONObject
     */
    public JSONObject toJSON() {
        Map<String, Object> map = new HashMap<>();
        Map<String, Object> mapRange = new HashMap<>();
        Map<String, Object> mapStartPos = new HashMap<>();
        Map<String, Object> mapEndPos = new HashMap<>();

        mapStartPos.put("line", startLineNumber);
        mapStartPos.put("char", startCharacter);
        mapEndPos.put("line", endLineNumber);
        mapEndPos.put("char", endCharacter);

        mapRange.put("start", mapStartPos);
        mapRange.put("end", mapEndPos);

        map.put("name", name);
        map.put("range", mapRange);
        return new JSONObject(map);
    }
}
