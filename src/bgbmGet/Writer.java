package bgbmGet;
import java.io.*;

// source http://stackoverflow.com/questions/1053467/how-do-i-save-a-string-to-a-text-file-using-java
public class Writer {
	
	OutputStream outputStream = null;
	
	public void stringToFile(InputStream input, String fileName)
	 {
	 try
	 {
	    File file = new File( fileName );

	    // if file doesnt exists, then create it 
	    if ( !file.exists( ) )
	    {
	        file.createNewFile( );
	       
	    } else {
	    	return; // Skip file write
//	    	PrintWriter writer = new PrintWriter(file);
//	    	writer.print("");
//	    	writer.close();
	    }
	   
	    outputStream = new FileOutputStream(file);
	    int read = 0;
		byte[] bytes = new byte[1024];
 
		while ((read = input.read(bytes)) != -1) {
			outputStream.write(bytes, 0, read);
		}
	    
	 }
	 catch( IOException e )
	 {
		 System.out.println("BgbmGet: Writing error: " + e);
		 e.printStackTrace( );
	 }
	} //End method stringToFile
}
