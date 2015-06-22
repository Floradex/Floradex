package dataHandling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import model.Plant;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.Namespace;
import org.jdom2.input.JDOMParseException;
import org.jdom2.input.SAXBuilder;

import tropicosGetter.TropicosGetter;
import AttributeReader.AttributeReader;
import AttributeReader.Knoten;
import JSONexporter.JSONexporter;
import bgbmGet.BgbmGet;


public class XmlReader{
	
	//String is the name of the plant, while the Data object contains the information, including the URL
	Hashtable<String, Data> datas;
	//a list of the plant names to make working with the Hashtable easier
	ArrayList<String> plants;
	
	private Namespace rdf = Namespace.getNamespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	private Namespace dc = Namespace.getNamespace("http://purl.org/dc/terms/");
	private Namespace dwc = Namespace.getNamespace("http://rs.tdwg.org/dwc/terms/");
	private LinkedList<String> chosenPlants;
	BgbmGet getterBgbm;
	TropicosGetter getterTropicos;
	
	public XmlReader() {
		super();
		this.datas = new Hashtable<String, Data>();
		this.plants = new ArrayList<String>();
		this.chosenPlants = new LinkedList<String>();
		getChosenPlants("resources/chosenPlants.txt");
		this.getterBgbm = new BgbmGet("resources/Metadata/");
		this.getterTropicos = new TropicosGetter("resources/Metadata");
	}
	
	public XmlReader(String[] files) {
		super();
		this.datas = new Hashtable<String, Data>();
		this.plants = new ArrayList<String>();
		this.chosenPlants = new LinkedList<String>();
		getChosenPlants("resources/chosenPlants.txt");
		this.getterBgbm = new BgbmGet("resources/Metadata/");
		this.getterTropicos = new TropicosGetter("resources/Metadata/");

		//copy the information of the catalog into a Hashtable
		for(int i = 0; i < files.length; i++){
			System.out.println("Reading file " + files[i]);
			readContent("catalog", files[i]);
		}
		// download infos from bgbm for all plants
		Iterator<String> iter = this.plants.iterator();
		while(iter.hasNext()) {
			String currentPlant = iter.next();
			this.getterBgbm.download(this.datas.get(currentPlant).getURLsArray());
		}
		
		File folder = new File("resources/Metadata");
		File[] listOfFiles = folder.listFiles(); // all metadata
		
		// Go threw all metadata files and load them 
		for (int i = 0; i < listOfFiles.length; i++) {
			if(listOfFiles[i].isFile() && !listOfFiles[i].getName().startsWith(".")) {
				readContent("meta", "resources/Metadata/" + listOfFiles[i].getName());

			} 
		}
		
		//get the taxonomic data and add it to the plants
		iter = this.plants.iterator();
		while(iter.hasNext()) {
			String currentPlant = iter.next();
			this.getterTropicos.download(currentPlant);
			readContent("taxa", "resources/Metadata/" + currentPlant + ".xml");
		}
		
		//get the descriptions
		iter = this.plants.iterator();
		while(iter.hasNext()) {
			String currentPlant = iter.next();
			readContent("descriptions", "resources/paulsOrdner/" + this.datas.get(currentPlant).getSampleId() + "-desc.xml");
		}
		
		
		//transfer all data sets to Plant objects
		iter = this.plants.iterator();
		
		// export all plants to json
		System.out.println("Exporting to JSON");
		List<Plant> allPlants = new LinkedList<Plant>();
		HashMap<String, Plant> plantNameToPlantMap = new HashMap<String, Plant>();
		while(iter.hasNext()) {
			String next = iter.next();
			Plant temp = this.datas.get(next).transferToPlantObject();
			plantNameToPlantMap.put(temp.getScientificName(), temp);
			allPlants.add(temp);
		}
		JSONexporter exporter = new JSONexporter();
		exporter.exportObjectToJSON(allPlants, "allPlants.json");
		
		// Combine with attributes
		File f = new File("input.txt"); // File to read
		System.out.println("Reading menu structure.");
		// Usage
		AttributeReader reader = new AttributeReader(plantNameToPlantMap,f);
		reader.start();
		
		// convert to list
		LinkedList<Knoten> list = new LinkedList<Knoten>();
		reader.makeListFromMap(reader.outputDict, list);
		
		// make empty images
		reader.makeEmptyImages(reader.outputDict, "resources/output/neededImages");
		// export
		exporter.exportObjectToJSON(list, "menuStructure.json");
	}
	
	/**
	 * Reads information from a XML file
	 * @param mode The case used, either catalog, meta or taxa
	 * @param filename The name of the file to be read
	 */
	private void readContent(String mode, String filename) {
		SAXBuilder builder = new SAXBuilder();
		Document doc = null;
		File xmlFile = new File(filename);
		if(xmlFile.exists()) {
			try {
				doc = builder.build(xmlFile);
			} catch (JDOMParseException e) {
				System.out.println("XmlReader: JDOMParseException when reading file " + xmlFile + ": " + e.getMessage());
				return;
			} catch (JDOMException | IOException e) {
				System.out.println("XmlReader: JDOMException/IOException when reading file " + xmlFile + ": " + e.getMessage());
				e.printStackTrace();
			}
			
			switch(mode) {
				case "catalog":
					//Description, Occurrence, Bag -> li's
					List<Element> listCatalog = doc.getRootElement().getChildren();
					for(Element elem : listCatalog){
						List<Element> childList = elem.getChildren();
						for(Element child : childList){
							if(child.getName() == "Occurrence"){
								for(Element exem : child.getChild("Bag", rdf).getChildren()){
									String name = exem.getChild("Description", rdf).getChildText("title", dc);
									String url = exem.getChild("Description", rdf).getAttributeValue("about", rdf);
									if(this.datas.containsKey(name)) {
										Data temp = this.datas.get(name);
										temp.addURL(url);
										this.datas.replace(name, temp);
									} else {
										if(this.chosenPlants.contains(name)) {
											this.datas.put(name, new Data(name, url));
											this.plants.add(name);
										}
									}
								}
							}
						}
					}
					break;
				case "meta":
					//Description -> dc's and dwc's
					List<Element> listMetaData = doc.getRootElement().getChildren();
					for(Element elem : listMetaData){
						List<Element> childList = elem.getChildren();
						String currentPlantName = "";
						for(Element child : childList){
							//System.out.println(child);
							if(child.getName().equals("title")) {
								currentPlantName = child.getText();
								//System.out.println("CURRENT NAME: " + currentPlantName);
							} else {
						
								if(child.getNamespace().equals(dwc)) {
									if (this.datas.containsKey(currentPlantName)) {
										this.datas.get(currentPlantName).addInformation(child.getName(), child.getText());
									}			
								}
							}
						}
					}
					break;
				case "taxa":
					//needs the filename as name for the key to put the information into the data
					String plant = xmlFile.getName().replace(".xml", "");
					List<Element> listTaxaData = doc.getRootElement().getChildren();
					for(Element elem : listTaxaData){
						List<Element> childList = elem.getChildren();
						String rank = "";
						String scientificName = "";
						for(Element child : childList) {
							if(child.getName().equals("Rank")) {
								rank = child.getText();
							}
						}
						for(Element child : childList) {
							if(child.getName().equals("ScientificName")) {
								scientificName = child.getText();
							}
						}
						if(rank != "" && scientificName != "") {
							this.datas.get(plant).addInformation(rank, scientificName);
						}
					}
					break;
				case "descriptions":
					String plantName = doc.getRootElement().getChild("name").getText();
					String description = doc.getRootElement().getChild("description").getText();
					//String description = this.makeUmlautsInHTMLDisplayable(doc.getRootElement().getChild("description").getText());
					//System.out.println(plantName + ":\n" + description);
					this.datas.get(plantName).addInformation("description", description);
					break;
				default:
					System.out.println("XmlReader: Please choose a mode when using readContent: \"catalog\", \"meta\" or \"taxa\"");
			}
		} else {
			System.out.println("XmlReader: Error file " + xmlFile.getAbsolutePath() + " does not exist");
		}
	}
	
	/**
	 * Prints all data contained in the Data object
	 */
	public void printData(){
		Iterator<String> iter = this.plants.iterator();
		while(iter.hasNext()) {
			String plantName = iter.next();
			System.out.println("Information for " + plantName);
			System.out.println(this.datas.get(plantName).toString());
		}
	}
	
	/**
	 * Reads the contents of the given file and puts them into local private LinkedList chosePlants
	 * @param filename The name of the file containing the plants to be used
	 */
	private void getChosenPlants(String filename){
		FileReader reader;
		BufferedReader buffer;
		try {
			reader = new FileReader(filename);
			buffer = new BufferedReader(reader);
			String content = "";
			while(content != null) {
				content = buffer.readLine();
				this.chosenPlants.add(content);
			}
			buffer.close();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public Hashtable<String, Data> getData(){
		return this.datas;
	}
	
	private String makeUmlautsInHTMLDisplayable(String text) {
		return text.replace("ä", "&auml;").replace("ü", "&ouml;").replace("ü", "&uuml;").replace("Ä", "&Auml;").replace("Ö", "&Ouml;").replace("Ü", "&Uuml;").replace("ß", "&szlig;");
	}
}
