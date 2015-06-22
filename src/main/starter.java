package main;

import java.io.File;
import java.util.Enumeration;
import java.util.Hashtable;

import thumbnailMaker.ThumbnailMaker;
import dataHandling.Data;
import dataHandling.XmlReader;

public class starter {

	public static void main(String[] args) {
		// Lade Katalog
		XmlReader reader = null;
		if(args.length < 1) {
			String[] catalog = {"resources/catalog.xml"};
			reader = new XmlReader(catalog);
		} else {
			reader = new XmlReader(args);
		}
		//reader.printData();
		
		//get the images for the thumbnails
		System.out.println("Downloading images and creating thumbnails from them");
		ThumbnailMaker maker = new ThumbnailMaker();
		Hashtable<String, Data> info = reader.getData();
		Enumeration<Data> enums = info.elements();
		while(enums.hasMoreElements()) {
			Data temp = enums.nextElement();
			String url = temp.getInformation("associatedMedia");
			if(url != "") {
				File folder = new File("resources/images/");
				maker.downloadFromUrlIntoFile(url, folder, temp.getSampleId());
			}
		}
		
		System.out.println("Finished");
	}
	
}
