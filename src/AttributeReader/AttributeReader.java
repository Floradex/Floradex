package AttributeReader;

import java.awt.List;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;

import JSONexporter.JSONexporter;
import AttributeReader.Knoten.KnotenType;
import model.Plant;

public class AttributeReader {
	boolean log = false;
	
	// source
	Map<String, Plant> sourceMaterial;
	File file;
	
	// bookeeping
	Plant currentPlant;
	int currentTab = 0;
	int globalWeight = 0;
	boolean validFormat = false;
	
	// Output stuff 
	public Map<String, Knoten> outputDict =  new HashMap<String, Knoten>();
	//Map<String, Knoten> currentDict = outputDict;
	
	//Map<String, Map<String, Knoten>> results = new HashMap<String, Map<String, Knoten>>();
	
	Knoten lastKnoten;
	
//	public static void main(String[] args) {
//		// File to read
//				File f = new File("input.txt");
//				
//				// Source material
//				Map<String, Plant> dict = new HashMap<String, Plant>();
//				Plant tempPlant = new Plant();
//				tempPlant.setSampleID("BW17435010");
//				dict.put("Urtica pubescens", tempPlant);
//				
//				// Usage
//				AttributeReader reader = new AttributeReader(dict,f);
//				reader.start();
//				
//				// convert to list
//				LinkedList<Knoten> list = new LinkedList<Knoten>();
//				reader.makeListFromMap(reader.outputDict, list);
//				
//				// export
//				JSONexporter exporter = new JSONexporter();
//				String json = exporter.exportObjectToJSON(list, "test.json");
//		
//	}
	
	public LinkedList<Knoten> makeListFromMap(Map<String, Knoten> map, LinkedList<Knoten> rootList) {
		for (Knoten k : map.values()) {
			rootList.add(k);
			if (k.getChildren().size() > 0) {
				k.children = new LinkedList<Knoten>();
				this.makeListFromMap(k.getChildren(), k.children);
			}
		}
		return rootList;
	}

	public AttributeReader(Map<String, Plant> sourceMaterial, File file) {
		this.sourceMaterial = sourceMaterial;
		this.file = file;
	}
	
	
	public void start() {
		try (BufferedReader br = new BufferedReader(new FileReader(file))) {
		    String line;
		    while ((line = br.readLine()) != null) {
		       this.processLine(line);
		    }
		} catch (FileNotFoundException e) {
			System.err.println("File not found");
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		if (log) {
				 this.printOrLook(outputDict, 1);
			
		}
//		
		
	}
	
	private void processLine(String line) { 
		//System.out.println(line);
		// Handle new Plant
		if (line.equals("")) {
			//System.err.println("Empty line ignored.");
		}
		else if (!line.startsWith("\t")) {
			//System.out.println(" newPlant ");
			currentTab = 0;
			Plant tmp = this.sourceMaterial.get(line.trim());
			if (tmp != null) {
				currentPlant = tmp;
				validFormat = true;
				//results.put(currentPlant.getSampleID(), outputDict);
			} else {
				System.err.println("Plant " + line.trim() + " not found in data.");
			}
		}
		else {
			int count = line.length() - line.replace("\t", "").length();
			
			Knoten tempKnoten = new Knoten(line); // aktueller knoten	
			
			
			if (count == 1) { // erste ebene
				if (outputDict.get(tempKnoten.getName()) != null) { // Exists
					tempKnoten = outputDict.get(tempKnoten.getName());
				}
				else {
					if (log) System.out.println(" 1add " + tempKnoten.getName() + " added as child added to " + outputDict);
					outputDict.put(tempKnoten.getName(), tempKnoten);
				}
				//currentDict = tempKnoten.getChildren();	
				currentTab = 1;
				globalWeight = 0;
				lastKnoten = tempKnoten;
			} else { // alle anderen
				if (count == currentTab + 1) { // nächste ebene
					if (log)System.out.println(" next ");
				} else if (count == currentTab) { // gleiche ebene
					if (log)System.out.println(" same ");
					
					lastKnoten = lastKnoten.getParent();
					//currentDict = lastKnoten.getChildren(); 
				} else { // alte ebene
					
					int toGoBack = currentTab - count;
					if (log) System.out.println("goBack" +toGoBack);
					for (int i = 0; i <= toGoBack; i++) {
						if (lastKnoten.getType() == KnotenType.MERKMAL) { // gewicht senken
							this.globalWeight--;
							//System.out.println("-" + globalWeight);
						}
						lastKnoten = lastKnoten.getParent();
						//currentDict = lastKnoten.getChildren();
					}
				}
					
					Knoten d = lastKnoten.getChildren().get(tempKnoten.getName());
					if (d == null) { // neuer knoten
						if (log) System.out.println(tempKnoten.getName() + " added as child to " + lastKnoten.getName() +" into dict " + lastKnoten.getChildren());
						tempKnoten.setParent(lastKnoten);
						lastKnoten.getChildren().put(tempKnoten.getName(), tempKnoten);
						//currentDict = tempKnoten.getChildren();
					} else { // existierender knoten
						if (log) System.out.println(" loadKnoten: " + d.getName());
						tempKnoten = d;
					}
					
					if (tempKnoten.getType() == KnotenType.MERKMAL) { // merkmal
						if (count == currentTab + 1) { // gewicht erhöhen
							globalWeight++;
							//System.out.println("+" + globalWeight);
						}
						if (log) System.out.println("addingPlant " + tempKnoten.getName());
						tempKnoten.setWeight(globalWeight);
						tempKnoten.getPlantIds().add(currentPlant.getSampleID());
					}
					
				
				currentTab = count; 
				lastKnoten = tempKnoten;
			}
			
			
			
		} 
	}
	
	public void printOrLook(Map<String, Knoten> dict, int level) {
//		System.out.println(dict);
		for (String key : dict.keySet()) {
			for (int i = 0; i < level; i++) {
				System.out.print("\t");
			}
			Knoten entry = dict.get(key);
			System.out.print(" " + key);
			System.out.println();
			if (entry.getChildren().size() != 0) {
				this.printOrLook(entry.getChildren(), level + 1);
			}
		}
		
	}
	
	
	public void makeEmptyImages(Map<String, Knoten> dict, String dir) {
		for (String key : dict.keySet()) {
			Knoten entry = dict.get(key);
			if (entry.getName() != null) {
				String alphaOnly = entry.getName().replaceAll("[^a-zA-Z]+","");
				alphaOnly = alphaOnly + ".png";
			
				Path path = Paths.get(dir + "/" + alphaOnly);

				
				final Path tmp = path.getParent();
				if (tmp != null)
					try {
						Files.createDirectories(tmp);
					} catch (IOException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
		            try {
						Files.createFile(path);
					} catch (IOException e) {
						// TODO Auto-generated catch block
					}
			}
			
	        
			
			if (entry.getChildren().size() != 0) {
				this.makeEmptyImages(entry.getChildren(),dir);
			}
		}
		
	}
	
	
}
