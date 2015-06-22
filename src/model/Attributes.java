package model;

import java.util.Hashtable;

public class Attributes {
	private Hashtable<String, String> attributeList;
	
	public Attributes() {
		this.attributeList = new Hashtable<String, String>();
	}
	
	public Hashtable<String, String> getAttributes() {
		return this.attributeList;
	}
	
	public boolean containsAttribute(String attribute, String value) {
		String[] attributeArray = this.attributeList.get(attribute).split("\\$");
		for(int i = 0; i < attributeArray.length; i++) {
			//System.out.println("- attributeArray[i]:" + attributeArray[i] + " == " + value + "? " + attributeArray[i].equals(value));
			if(attributeArray[i].equals(value)) {
				return true;
			}
		}
		return false;
	}
}
