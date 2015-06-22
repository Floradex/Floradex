package AttributeReader;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class Knoten {
	String name;
	KnotenType type;
	
	transient Map<String, Knoten> childrenMap;
	public LinkedList<Knoten> children;
	transient Knoten  parent;
	
	MerkmalPosition position;
	LinkedList<String> plantIds = null;
	Integer weight;
	
	public enum KnotenType {
		MERKMAL, KATEGORIE
	}
	
	public enum MerkmalPosition {
		LEBENSFORM, BLUETE, KOPF, BLATT
	}
	
	public Knoten(String line) {
		super();
		line = line.trim();
		if (line.startsWith("Kategorie:")) { // Kategorie
			line = line.replace("Kategorie:", "");
			setType(KnotenType.KATEGORIE);
			setName(line);
		} else { // Merkmal
			setType(KnotenType.MERKMAL);
			
			for (MerkmalPosition c : MerkmalPosition.values()) {
		        if (line.startsWith(c.name())) {
		        	setPosition(c);
		        	line = line.replace( c.name() + ":", "");
					setName(line);
					//System.out.println("started with " + c.name());
		        }
		    }
			
		}
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name.trim();
	}

	public KnotenType getType() {
		return type;
	}

	public void setType(KnotenType type) {
		this.type = type;
	}

	public MerkmalPosition getPosition() {
		return position;
	}

	public void setPosition(MerkmalPosition position) {
		this.position = position;
	}

	public Map<String, Knoten> getChildren() {
		if (childrenMap == null) {
			this.childrenMap = new HashMap<String, Knoten>();
		}
		return childrenMap;
	}

	public LinkedList<String> getPlantIds() {
		if (plantIds == null) {
			plantIds = new LinkedList<String>();
		}
		return plantIds;
	}

	public void setPlantIds(LinkedList<String> plantIds) {
		this.plantIds = plantIds;
	}

	public int getWeight() {
		return weight;
	}

	public void setWeight(int weight) {
		this.weight = weight;
	}

	public Knoten getParent() {
		return parent;
	}

	public void setParent(Knoten parent) {
		this.parent = parent;
	}

	
	
	

}
