package dataHandling;

import java.util.ArrayList;
import java.util.Hashtable;

import model.Plant;

public class Data {
	
	private String name;
	private Hashtable<String, String> information;
	private ArrayList<String> urls;
	
	public Data(String name) {
		this.name = name;
		this.information = new Hashtable<String, String>();
		this.urls = new ArrayList<String>();
	}
	
	public Data(String name, String url) {
		this.name = name;
		this.information = new Hashtable<String, String>();
		this.urls = new ArrayList<String>();
		this.addURL(url);
	}
	
	public String getname() {
		return this.name;
	}
	
	void setname(String name) {
		this.name = name;
	}
	
	public String getInformation(String info) {
		if(this.information.containsKey(info)) {
			return this.information.get(info);
		}
		else {
			return "";
		}
	}
	
	Hashtable<String, String> getAllInformation() {
		return this.information;
	}
	
	/**
	 * Add a piece of information to this object, when a key is already present the new information is added with a dollar sign ($) to separate them
	 * @param key The key value, which is used to store the element
	 * @param value The piece of information
	 */
	void addInformation(String key, String value){
		if(this.information.containsKey(key) && !value.contains("Unknown") && !value.contains("unknown") && !value.contains("Unspecified") && !value.contains("unspecified") && value.contains("")) {
			this.information.put(key, value);
		} else {
			this.information.put(key, value);
		}
	}
	
	ArrayList<String> getURLsList() {
		return this.urls;
	}

	
	public String getSampleId() {
		return this.information.get("SampleID").split("/")[this.information.get("SampleID").split("/").length - 1]; // Parse sampleid		
	}
	
	String[] getURLsArray() {
		return this.urls.toArray(new String[this.urls.size()]);
	}
	
	void addURL(String url) {
		this.urls.add(url);
	}
	
	public Plant transferToPlantObject() {
//		if (!this.information.contains("SampleID")) {
//			System.err.println("transferToPlantObject: No data for this element: " + this.name);
//			return new Plant();
//		}
		// bgbm information
		String SampleID = this.information.get("SampleID").split("/")[this.information.get("SampleID").split("/").length - 1]; // Parse sampleid		
		// catalog
		String title = this.name;
		String description = this.information.get("Description");
		// bgbm information
		String BasisOfRecord = this.information.get("BasisOfRecord");
		String InstitutionCode = this.information.get("InstitutionCode");
		String CollectionCode = this.information.get("CollectionCode");
		String CatalogNumber = this.information.get("CatalogNumber");
		String ScientificName = this.information.get("ScientificName");
		String Family = this.information.get("Family");
		String SpecificEpithet = this.information.get("SpecificEpithet");
		String HigherGeography = this.information.get("HigherGeography");
		String Country = this.information.get("Country");
		String Locality = this.information.get("Locality");
		String Collector = this.information.get("Collector");
		String associatedMedia = this.information.get("associatedMedia");
		// Tropicos
		String t_subclass = this.information.get("subclass");
		String t_superorder = this.information.get("superorder");
		String t_order = this.information.get("order");
		String t_family = this.information.get("family");
		String t_subfamily = this.information.get("subfamily");
		String t_supertribe = this.information.get("supertribe");
		String t_tribe = this.information.get("tribe");
		String t_subtribe = this.information.get("subtribe");
		String t_genus = this.information.get("genus");
		String t_section = this.information.get("section");
		//descriptions
		String volksname = this.information.get("volksname");
		String geo = this.information.get("geo");
		String distribution = this.information.get("distribution");
		String sun = this.information.get("sun");
		String water = this.information.get("water");
		String winter = this.information.get("winter");
		String size = this.information.get("size");
		String bloom = this.information.get("bloom");
		String eatable = this.information.get("eatable");
		String med = this.information.get("med");
		String altlink = this.information.get("altlink");
		String marker1_lat = this.information.get("marker1_lat");
		String marker1_long = this.information.get("marker1_long");
		String marker2_lat = this.information.get("marker2_lat");
		String marker2_long = this.information.get("marker2_long");
		String marker3_lat = this.information.get("marker3_lat");
		String marker3_long = this.information.get("marker3_long");
		String marker4_lat = this.information.get("marker4_lat");
		String marker4_long = this.information.get("marker4_long");
		String marker5_lat = this.information.get("marker5_lat");
		String marker5_long = this.information.get("marker5_long");
		
		Plant ret = new Plant(SampleID, title, description,
				BasisOfRecord, InstitutionCode,
				CollectionCode, CatalogNumber,
				ScientificName, Family, SpecificEpithet,
				HigherGeography, Country, Locality,
				Collector, associatedMedia, t_subclass,
				t_superorder, t_order, t_family,
				t_subfamily, t_supertribe, t_tribe,
				t_subtribe, t_genus, t_section,
				volksname, geo, distribution,
				sun, water, winter, size, bloom, eatable, med, altlink,
				marker1_lat, marker1_long, marker2_lat, marker2_long,
				marker3_lat, marker3_long, marker4_lat, marker4_long,
				marker5_lat, marker5_long);
		//ret.print();
		return ret;
	}
	
	@Override
	public String toString() {
		String ret = "[name=" + this.name + ", Information: " + this.information.toString() + ", URLs: " + this.urls.toString() + "]" + "\nCollection:\n";
		return ret;
	}
}
