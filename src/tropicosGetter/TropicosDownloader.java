package tropicosGetter;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL; 
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.HttpsURLConnection;
import javax.print.attribute.ResolutionSyntax;



// source http://www.mkyong.com/java/how-to-send-http-request-getpost-in-java/
public class TropicosDownloader {
	private final String USER_AGENT = "Mozilla/5.0";
	public boolean fullInfo = false;
	
	final String apiKey = "0208ac19-0562-4e08-a800-22f216659f73";
	
	public String downloadTaxaWithScientificName(String scientificName) {
		String id = "";
		try {
			id = this.getId(scientificName);
		} catch (Exception e) {
			System.err.print(".");
			e.printStackTrace();
		}
		if (id.equals("")) {
			return "";
		} else {
			try {
				return this.getHigherTaxa(id);
			} catch (Exception e) {
				System.err.print(".");
				e.printStackTrace();
				return "";
			}

		}
	}
	
	private String getId(String scienfiticName) throws Exception {			
			String url = "http://services.tropicos.org/Name/Search?name=" + scienfiticName.replace(".", "") + "&type=wildcard&apikey=" + apiKey + "&format=xml";
			url = url.replace(" ", "%20");
			
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
	 
			// optional default is GET
			con.setRequestMethod("GET");
	 
			//add request header
			con.setRequestProperty("User-Agent", USER_AGENT);
			
			//InputStream xml = con.getInputStream();
			
			BufferedReader in = new BufferedReader(
			        new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();
	 
			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
	 
			//print result
//			if (fullInfo) {
//				System.out.println(response.toString());
//			}
			String responseString = response.toString();
			
			if(responseString.contains("<Error>No names were found</Error>")) {
				System.out.print("_");
				String[] spl = scienfiticName.split(" ");
				String string = "";
				// check if only 1 word
				if (spl.length <= 2) {
					System.err.print(".");
					return "";
				}
				// cut last word
				for (int i = 0; i < spl.length -1; i++) {
					string += spl[i] + " ";
				}
				string = string.trim();
				System.out.println("\""+ string+"\"");
				return this.getId(string);
			} else {
				String result = responseString.substring(responseString.indexOf("<NameId>") + 8, responseString.indexOf("</NameId>"));
				
				return result;
			}
		}
		
	
	private String getHigherTaxa(String id) throws Exception {
		String url = "http://services.tropicos.org/Name/" + id + "/HigherTaxa?&apikey=" + apiKey + "&format=xml";
		url = url.replace(" ", "%20");
		
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
 
		// optional default is GET
		con.setRequestMethod("GET");
 
		//add request header
		con.setRequestProperty("User-Agent", USER_AGENT);
		
		//InputStream xml = con.getInputStream();
		
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();
 
		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine + "\n");
		}
		in.close();

		String responseString = response.toString();
		
		if (responseString.contains("<Error>No records were found</Error>")) {
			return "";
		}
		
		return responseString;
	}
}
