package thumbnailMaker;

import java.awt.Graphics2D;
import java.awt.GraphicsConfiguration;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.Image;
import java.awt.Rectangle;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;

import javax.imageio.ImageIO;

public class ThumbnailMaker {
	static float[] standartScales = new float[]{25,50,100,200,240}; // around 40KB per image
	static File STANDART_IMAGE = new File("resources/images/standardImages/standard.png");
	static int DOWNLOAD_TRYS = 5;
	
	static boolean DEBUG = false;

	// Code for download manually .move image to originalImages/ and put BGBG code here
//	public static void main(String[] args) {
//		ThumbnailMaker maker = new ThumbnailMaker();
//		//String testImage = "http://ww2.bgbm.org/herbarium/images/B/-W/06/96/B_-W_06960%20-01%200.jpg";
//		File testFile = new File("resources/images");
//		maker.downloadFromUrlIntoFile(null, testFile, "BGT0000308");
//	}
	
	public void downloadFromUrlIntoFile(String url, File folder, String filename) {
		this.downloadFromUrlIntoFile(url, folder, filename, standartScales);
	}
	
	/***
	 * Downloads an Image from an URL, scales it by a factor and saves it in a file.
	 * @param url String source URL
	 * @param file File destination file. USE PNG!
	 * @param scale	desired scale
	 */
	public void downloadFromUrlIntoFile(String url, File folder, String filename, float[] scale) {
		//if the directory for the image does not exist, create it
		if(!folder.exists()) {
			System.out.println("ThumbnailMaker: Creating directory " + folder);
			folder.mkdir();
		}
		File originalImageFolder = new File(folder.getAbsolutePath() + "/originalFiles/");
		if(!originalImageFolder.exists()) {
			originalImageFolder.mkdir();
		}
		
		// try downloading image 3 times
		Integer count = 1;
		BufferedImage bufferedImage = null;
		
		// download original file
		if (bufferedImage == null && url != null) {
			try {
				saveOriginalImage(originalImageFolder.getAbsolutePath() + "/" + filename + ".jpg", new URL(url.replace(" ", "%20")));
			} catch (MalformedURLException e1) {
				System.err.println("Thumbnailmaker: MalformedURLException caused by " + e1.getMessage());
			}
		}
		
		// Try to read from disk
		try {
			File image = new File(originalImageFolder.getAbsolutePath() + "/" + filename + ".jpg");
			if (image.exists()) {
				bufferedImage = ImageIO.read(image);
				if (bufferedImage != null) {
					//System.out.print(".");
				}
			} else {
				System.out.println("Thumbnailmaker: File " + image.getAbsolutePath() + " not found");
			}
		} catch (IOException e) {
			System.err.println("Thumbnailmaker:  IO Error reading file: " + originalImageFolder.getAbsolutePath() + "/" + filename + ".jpg");
		}
		
		// Try to download multiple times
		if (bufferedImage == null) {
			Image image = null;
			while (image == null && count <= DOWNLOAD_TRYS) {
				image = this.downloadImage(url.replace(" ", "%20"));
				//System.out.print(".");
				try {
					Thread.sleep(500); // wait a little
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				count++;
			}
			if (image == null) { // still no image
				System.err.println("Thumbnail download: No Image found for: " + filename +" at " + url);
				return;
			}
			bufferedImage = ThumbnailMaker.toBufferedImage(image);
		}
		
		// crop rectangle
		bufferedImage = this.cropImageToRectangle(bufferedImage, 150);
		
		// Scale
		for (float f : scale) {
			File outputfile = new File(folder.toString(),filename + "-" + (int)f + ".png");
			if (! outputfile.exists() || DEBUG) {
				try {
					BufferedImage scaledImage = this.scale(bufferedImage, f);
				    ImageIO.write(scaledImage, "png", outputfile);
				    //System.out.println(".");
				} catch (IOException e) {
					System.err.println("ThumbnailMaker: Error writing thumbnail.");
				} catch (NullPointerException e) {
					System.err.println("ThumbnailMaker: NullPointerException in downloadFromUrlIntoFile during scaling, because of error: " + e.getMessage());
				}
			} else {
				//System.out.print(">");
			}
			
		}
		
	}
	
//	/***
//	 * Downloads an Image from an URL, scales it by a factor of 0.07 (around 40KB) and saves it in a file.
//	 * @param url String source URL
//	 * @param file File destination file. USE PNG!
//	 */
//	public void downloadFromUrlIntoFile(String url, File file) {
//		this.downloadFromUrlIntoFile(url, file,"test", standartScales);
//	}
	
	// source http://stackoverflow.com/questions/1069095/how-do-you-create-a-thumbnail-image-out-of-a-jpeg-in-java
	private BufferedImage scale(BufferedImage source,double height) {
		  int w = (int) ((int) source.getWidth() * (height / source.getHeight())) ;
		  int h = (int) height; // TODO make use ma height
		  BufferedImage bi = getCompatibleImage(w, h);
		  Graphics2D g2d = bi.createGraphics();
		  double xScale = (double) w / source.getWidth();
		  double yScale = (double) h / source.getHeight();
		  AffineTransform at = AffineTransform.getScaleInstance(xScale,yScale);
		  g2d.drawRenderedImage(source, at);
		  g2d.dispose();
		  return bi;
	}

	private BufferedImage getCompatibleImage(int w, int h) {
		  GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
		  GraphicsDevice gd = ge.getDefaultScreenDevice();
		  GraphicsConfiguration gc = gd.getDefaultConfiguration();
		  BufferedImage image = gc.createCompatibleImage(w, h);
		  return image;
	}
	
	public Image downloadImage(String imageUrl) {
		Image image = null;
		try {
		    URL url = new URL(imageUrl);
		    image = ImageIO.read(url);
		} catch (IOException e) {
			
		}
		return image;
	}
	
	 private BufferedImage cropImageToRectangle(BufferedImage src, int offset) {
		 BufferedImage dest = null;
		 try{
			 dest = src.getSubimage(0,  offset, src.getWidth(), src.getWidth());
		 } catch(NullPointerException e) {
			 System.out.println("ThumbnailMaker: NullPointerException in cropImageToRectangle, because of error: " + e.getMessage());
		 }
	      return dest; 
	   }
	
	// source http://stackoverflow.com/questions/13605248/java-converting-image-to-bufferedimage
	public static BufferedImage toBufferedImage(Image img)
	{
	    if (img instanceof BufferedImage)
	    {
	        return (BufferedImage) img;
	    }
	    BufferedImage bimage = null;
	    try{
	    	// Create a buffered image with transparency
	    	bimage = new BufferedImage(img.getWidth(null), img.getHeight(null), BufferedImage.TYPE_INT_ARGB);
		    // Draw the image on to the buffered image
		    Graphics2D bGr = bimage.createGraphics();
		    bGr.drawImage(img, 0, 0, null);
		    bGr.dispose();
	    } catch(NullPointerException e){
	    	System.out.println("ThumbnailMaker: NullPointerException in toBufferedImage, because of error: " + e.getMessage());
	    }

	    // Return the buffered image
	    return bimage;
	}
	
	void saveOriginalImage(String filename, URL url) {
		try {
			InputStream in;
			
			in = new BufferedInputStream(url.openStream());
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			byte[] buf = new byte[1024];
			int n = 0;
			while (-1!=(n=in.read(buf)))
			{
			   out.write(buf, 0, n);
			}
			out.close();
			in.close();
			byte[] response = out.toByteArray();
			FileOutputStream fos = new FileOutputStream(filename);
			fos.write(response);
			fos.close();
		} catch(IOException e) {
			System.out.println("Thumbnailmaker: IOException in saveOriginalImage caused by" + e.getMessage());
		}
		
	}
}
