package JSONexporter;

import java.io.FileWriter;
import java.io.IOException;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;


public class JSONexporter {
	
	public  String exportObjectToJSON(Object dict, String file) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
	 
		// convert java object to JSON format,
		// and returned as JSON formatted string
		String json = gson.toJson(dict);
	 
		try {
			//write converted json data to a file named "file.json"
			System.out.println("JSONexporter: Writing into file " + file);
			FileWriter writer = new FileWriter(file);
			writer.write(json);
			writer.close();
	 
		} catch (IOException e) {
			System.out.println("JSONexporter: IOException, caused by " + e.getMessage());
			e.printStackTrace();
		}
		return json;
	}
}
