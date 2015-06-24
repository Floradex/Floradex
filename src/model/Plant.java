package model;

public class Plant {
		private String SampleID; // bgbm information
		// catalog
		private String title;
		private String description;
		
		// bgbm information
		private String BasisOfRecord;
		private String InstitutionCode;
		private String CollectionCode;
		private String CatalogNumber;
		private String ScientificName;
		private String Family;
		private String SpecificEpithet;
		private String HigherGeography;
		private String Country;
		private String Locality;
		private String Collector;
		private String associatedMedia;
		
		// Tropicos
		private String t_subclass;
		private String t_superorder;
		private String t_order;
		private String t_family;
		private String t_subfamily;
		private String t_supertribe;
		private String t_tribe;
		private String t_subtribe;
		private String t_genus;
		private String t_section;
		
		private String descriptionText;
		String volksname;
		String geo;
		String distribution;
		String sun;
		String water;
		String winter;
		String size;
		String bloom;
		String eatable;
		String med;
		
		public Plant() {
			// Empty plant
		}
		
		public Plant(String sampleID, String title, String description,
				String basisOfRecord, String institutionCode,
				String collectionCode, String catalogNumber,
				String scientificName, String family, String specificEpithet,
				String higherGeography, String country, String locality,
				String collector, String associatedMedia, String t_subclass,
				String t_superorder, String t_order, String t_family,
				String t_subfamily, String t_supertribe, String t_tribe,
				String t_subtribe, String t_genus, String t_section,
				String volksname, String geo, String distribution,
				String sun, String water, String winter, String size, String bloom, String eatable, String med) {
			super();
			this.SampleID = sampleID;
			this.title = title;
			this.description = description;
			this.BasisOfRecord = basisOfRecord;
			this.InstitutionCode = institutionCode;
			this.CollectionCode = collectionCode;
			this.CatalogNumber = catalogNumber;
			this.ScientificName = scientificName;
			this.Family = family;
			this.SpecificEpithet = specificEpithet;
			this.HigherGeography = higherGeography;
			this.Country = country;
			this.Locality = locality;
			this.Collector = collector;
			this.associatedMedia = associatedMedia;
			this.t_subclass = t_subclass;
			this.t_superorder = t_superorder;
			this.t_order = t_order;
			this.t_family = t_family;
			this.t_subfamily = t_subfamily;
			this.t_supertribe = t_supertribe;
			this.t_tribe = t_tribe;
			this.t_subtribe = t_subtribe;
			this.t_genus = t_genus;
			this.t_section = t_section;
			this.volksname = volksname;
			this.geo = geo;
			this.distribution = distribution;
			this.sun = sun;
			this.water = water;
			this.winter = winter;
			this.size = size;
			this.bloom = bloom;
			this.eatable = eatable;
			this.med = med;
		}


		public String getSampleID() {
			return SampleID;
		}


		public void setSampleID(String sampleID) {
			SampleID = sampleID;
		}


		public String getTitle() {
			return title;
		}


		public void setTitle(String title) {
			this.title = title;
		}


		public String getDescription() {
			return description;
		}


		public void setDescription(String description) {
			this.description = description;
		}


		public String getBasisOfRecord() {
			return BasisOfRecord;
		}


		public void setBasisOfRecord(String basisOfRecord) {
			BasisOfRecord = basisOfRecord;
		}


		public String getInstitutionCode() {
			return InstitutionCode;
		}


		public void setInstitutionCode(String institutionCode) {
			InstitutionCode = institutionCode;
		}


		public String getCollectionCode() {
			return CollectionCode;
		}


		public void setCollectionCode(String collectionCode) {
			CollectionCode = collectionCode;
		}


		public String getCatalogNumber() {
			return CatalogNumber;
		}


		public void setCatalogNumber(String catalogNumber) {
			CatalogNumber = catalogNumber;
		}


		public String getScientificName() {
			return ScientificName;
		}


		public void setScientificName(String scientificName) {
			ScientificName = scientificName;
		}


		public String getFamily() {
			return Family;
		}


		public void setFamily(String family) {
			Family = family;
		}


		public String getSpecificEpithet() {
			return SpecificEpithet;
		}


		public void setSpecificEpithet(String specificEpithet) {
			SpecificEpithet = specificEpithet;
		}


		public String getHigherGeography() {
			return HigherGeography;
		}


		public void setHigherGeography(String higherGeography) {
			HigherGeography = higherGeography;
		}


		public String getCountry() {
			return Country;
		}


		public void setCountry(String country) {
			Country = country;
		}


		public String getLocality() {
			return Locality;
		}


		public void setLocality(String locality) {
			Locality = locality;
		}


		public String getCollector() {
			return Collector;
		}


		public void setCollector(String collector) {
			Collector = collector;
		}


		public String getAssociatedMedia() {
			return associatedMedia;
		}


		public void setAssociatedMedia(String associatedMedia) {
			this.associatedMedia = associatedMedia;
		}


		public String getT_subclass() {
			return t_subclass;
		}


		public void setT_subclass(String t_subclass) {
			this.t_subclass = t_subclass;
		}


		public String getT_superorder() {
			return t_superorder;
		}


		public void setT_superorder(String t_superorder) {
			this.t_superorder = t_superorder;
		}


		public String getT_order() {
			return t_order;
		}


		public void setT_order(String t_order) {
			this.t_order = t_order;
		}


		public String getT_family() {
			return t_family;
		}


		public void setT_family(String t_family) {
			this.t_family = t_family;
		}


		public String getT_subfamily() {
			return t_subfamily;
		}


		public void setT_subfamily(String t_subfamily) {
			this.t_subfamily = t_subfamily;
		}


		public String getT_supertribe() {
			return t_supertribe;
		}


		public void setT_supertribe(String t_supertribe) {
			this.t_supertribe = t_supertribe;
		}


		public String getT_tribe() {
			return t_tribe;
		}


		public void setT_tribe(String t_tribe) {
			this.t_tribe = t_tribe;
		}


		public String getT_subtribe() {
			return t_subtribe;
		}


		public void setT_subtribe(String t_subtribe) {
			this.t_subtribe = t_subtribe;
		}


		public String getT_genus() {
			return t_genus;
		}


		public void setT_genus(String t_genus) {
			this.t_genus = t_genus;
		}


		public String getT_section() {
			return t_section;
		}


		public void setT_section(String t_section) {
			this.t_section = t_section;
		}	
		
		public void print() {
			System.out.println("Information for " + this.title + "(" + this.SampleID + ")");
			System.out.println("Description:\n" + this.description);
			System.out.println("\tBasisOfRecord: " + this.BasisOfRecord);
			System.out.println("\tInstitutionCode: " + this.InstitutionCode);
			System.out.println("\tCollectionCode: " + this.CollectionCode);
			System.out.println("\tCatalogNumber: " + this.CatalogNumber);
			System.out.println("\tScientificName: " + this.ScientificName);
			System.out.println("\tFamily: " + this.Family);
			System.out.println("\tSpecificEpithet: " + this.SpecificEpithet);
			System.out.println("\tHigherGeography: " + this.HigherGeography);
			System.out.println("\tCountry: " + this.Country);
			System.out.println("\tLocality: " + this.Locality);
			System.out.println("\tCollector: " + this.Collector);
			System.out.println("\tassociatedMedia: " + this.associatedMedia);
			System.out.println("\tt_subclass: " + this.t_subclass);
			System.out.println("\tt_superorder: " + this.t_superorder);
			System.out.println("\tt_order: " + this.t_order);
			System.out.println("\tt_family: " + this.t_family);
			System.out.println("\tt_subfamily: " + this.t_subfamily);
			System.out.println("\tt_supertribe: " + this.t_supertribe);
			System.out.println("\tt_tribe: " + this.t_tribe);
			System.out.println("\tt_subtribe: " + this.t_subtribe);
			System.out.println("\tt_genus: " + this.t_genus);
			System.out.println("\tt_section: " + this.t_section);
		}
	}