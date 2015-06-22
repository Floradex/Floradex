package bgbmGet;

import java.io.File;
import java.io.InputStream;

public class BgbmGet {
	
	String directory;
	
	public BgbmGet() {
		this.directory = "";
	}
	
	public BgbmGet(String directory) {
		this.directory = directory;
		File folder = new File(directory);
		System.out.println("BgbmGet: Writing to directory " + directory);
		if(!folder.exists()) {
			System.out.println("BgbmGet: Directory " + directory + " does not exist");
			if(folder.mkdir()) {
				System.out.println("BgbmGet: Created directory " + directory);
			} else {
				System.out.println("BgbmGet: Could not creat directory " + directory);
				
			}
		}
	}

	//public static void main(String[] args) {
	//	BgbmGet getter = new BgbmGet();
	//	getter.download(args);
	//} 
	
	public void download(String[] args) {
		if (args.length == 0) {
			System.out.println("BgbmGet: No arguments. Use -h for help.");
			return;
		}
		
		if (args[0].equals("-h")) {
			System.out.println("BgbmGet: Usage: BgbmGet XXX0002778 B100000002");
			System.out.println("BgbmGet: BgbmGet -f... for full info");
			return;
		}
		
		boolean fullInfo = false;
		if (args[0].equals("-f")) {
			fullInfo = true;
		}
		
		System.out.print("BgbmGet: Starting download.");
		
		// downloader
		Downloader loader = new Downloader();
		loader.fullInfo = fullInfo;
		// writer
		Writer writer = new Writer();
		String errors = "";

		for (int i = 0; i < args.length; i++) {
			String string = args[i];
			
			if (string.length() != 10) {
				String[] spl = string.split("/");
				String newString = spl[spl.length - 1];
				
				
				if (newString.length() != 10) { 
					System.err.println(".");
					errors += " " +  string + " not right format";
					continue;
				} else {
					string = newString;
				}
			}
			
			if (fullInfo) {
				System.out.println("BgbmGet: Downloading " + string);
			} else {
				
				File file = new File(  this.directory + string + ".xml" );
			    if ( file.exists( ) ) {
			    	System.out.print("_");
			    } else {
			    	System.out.print(".");
			    	try {				
						InputStream answer = loader.sendGet(string);
						writer.stringToFile(answer, this.directory + string + ".xml");
					} catch (Exception e) {
						System.err.println("BgbmGet: Error downloading " + string);
					}
			    }
				
			}
			
			
		}
		
		System.out.println(" Finished");
		if (!errors.equals("")) System.out.println("BgbmGet: Errors:" + errors);
		
	}

}
