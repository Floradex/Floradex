package bgbmGet;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL; 

import javax.net.ssl.HttpsURLConnection;

// source http://www.mkyong.com/java/how-to-send-http-request-getpost-in-java/
public class Downloader {
	private final String USER_AGENT = "Mozilla/5.0";
	public boolean fullInfo = false;
	
	public InputStream sendGet(String id) throws Exception {
			String returnValue = "";
		
			String url = "http://herbarium.bgbm.org/data/rdf/" + id;
	 
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
	 
			// optional default is GET
			con.setRequestMethod("GET");
	 
			//add request header
			con.setRequestProperty("User-Agent", USER_AGENT);
	 
			int responseCode = con.getResponseCode();
			if (fullInfo) {
				System.out.println("\nBgbmGet: Sending 'GET' request to URL : " + url);
				System.out.println("BgbmGet: Response Code : " + responseCode);
			}
			
			InputStream xml = con.getInputStream();
			
//			BufferedReader in = new BufferedReader(
//			        new InputStreamReader(con.getInputStream()));
//			String inputLine;
//			StringBuffer response = new StringBuffer();
//	 
//			while ((inputLine = in.readLine()) != null) {
//				response.append(inputLine);
//			}
//			in.close();
	 
			//print result
//			if (fullInfo) {
//				System.out.println(response.toString());
//			}
			return xml;
		}
}
