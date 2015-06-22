package tropicosGetter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;

public class TropicosGetter {
	
	//public static void main(String[] args) {
	//	TropicosGetter getter = new TropicosGetter();
	//	System.out.println(getter.download("Asyneuma compactum var. eriocarpum Parolly"));
	//}
	
	String directory;
	
	public TropicosGetter(){
		this.directory = "";
	}
	
	public TropicosGetter(String directory){
		this.directory = directory;
		File folder = new File(directory);
		System.out.println("TropicosGetter: Writing to directory " + directory);
		if(!folder.exists()) {
			System.out.println("TropicosGetter: Directory " + directory + " does not exist");
			if(folder.mkdir()) {
				System.out.println("TropicosGetter: Created directory " + directory);
			} else {
				System.out.println("TropicosGetter: Could not creat directory " + directory);
				
			}
		}
	}
	
	/***
	 * Downloads complete XML for scientific name of plant from tropicos.org
	 * It removes names until plant found or only two words left 
	 * e.g. Asyneuma compactum var. eriocarpum Parolly finds at
	 * @param scientificName String like Ocotea fasciculata
	 * @return XML or empty if error
	 */
	public void download(String scientificName) {
		// downloader
		TropicosDownloader loader = new TropicosDownloader();
		String answer = "";
		
		try {
			System.out.print(".");
			scientificName = scientificName.trim();
			answer = loader.downloadTaxaWithScientificName(scientificName);
			
		} catch (Exception e) {
			System.err.println("TropicosGetter: Error downloading from Tropicos.");
			System.err.println(e);
		}
		//write answer into a file
		PrintWriter writer;
		try {
			writer = new PrintWriter(this.directory + scientificName + ".xml", "UTF-8");
			writer.println(answer);
			writer.close();
		} catch (FileNotFoundException | UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
}
