angular.module('floradex', ['ionic', 'ionic.contrib.drawer', 'uiGmapgoogle-maps'])
    // http://angular-ui.github.io/angular-google-maps/#!/api
    .factory('Plants', function($http) {
        return {
            all: function(callback) {
                return $http.get('resources/allPlants.json').success(callback);
            }
        }
    })

.factory('MenuData', function($http) {
        return {
            all: function(callback) {
                return $http.get('resources/menuStructure.json').success(callback);
            }
        }
    })
    //if cookies are disabled localStorage will not work and throw the error that the operation "is unsafe"
    .factory('PlantStorage', function() {
        return {
            init: function() {
                //backup to clear storage
                //localStorage.clear();
                console.log(new String("Trying to load plants from storage...") + "");
                var plantString = window.localStorage.getItem('plants');
                if (plantString) {
                    console.log(plantString.split(";"));
                    return plantString.split(";");
                }
                console.log(new String("no data in storage found") + "");
                return [];
            },
            saveToHerbarium: function(plant) {
                var savedPlants = window.localStorage.getItem('plants');
                if (savedPlants) {
                    // check if plant is already in herbarium
                    console.log(new String("Plants in own herbarium: ") + savedPlants);
                    var result = savedPlants.search(plant);
                    if (result == -1) {
                        console.log(new String("Adding plant ") + plant);
                        window.localStorage.setItem('plants', savedPlants + ";" + plant);
                    } else {
                        console.log(new String("Plant ") + plant + " already in herbarium");
                    }
                } else {
                    console.log(new String("Saving plant ") + plant + new String(" in empty storage"));
                    window.localStorage.setItem('plants', plant);
                }
            },
            loadHerbarium: function() {
                var temp = window.localStorage.getItem('plants');
                if (temp) {
					var plants = temp.split(";");
                    console.log(plants);
                    return plants;
                } else {
                    return [];
                }
            },
            inHerbarium: function(plantID) {
                var plants = window.localStorage.getItem('plants');
                if (plants) {
                    var result = plants.search(plantID);
                    if (result > -1) {
                        return true;
                    }
                }
                return false;
            },
            removeFromHerbarium: function(plantID) {
                var plants = window.localStorage.getItem('plants').split(";");
                var indexOfPlant = plants.indexOf(plantID);
                plants.splice(indexOfPlant, 1);
                var temp = "";
                for (plant in plants) {
                    temp += plant + ";";
                }
                window.localStorage.setItem('plants', temp);
                console.log("removed:" + temp)
            }
        }
    })

.controller('MainCtrl', function($scope, $ionicScrollDelegate, $ionicPopover, $ionicModal, Plants, MenuData, PlantStorage) { // $ionicPopover,
        // debugging:
        var showModalViewsOnStartup = false;

        // vars
        var plantIdsLookup = {};
        //the saved plants from 'my herbarium', if plants were saved earlier
        $scope.herbarium = PlantStorage.init();

        // results
        $scope.countOfResults = 0;
        $scope.results = null;
        $scope.resultSettings = {
            size: 100
        }
        $scope.resultMode = "Baukasten"; // or "MeinHerbarium" or "SearchResults"
        // Merkmale
        $scope.selectedMerkmale = {};
        // Vorschau
        $scope.vorschauLebensform = [];
        $scope.vorschauBluete = [];
        $scope.vorschauKopf = [];
        $scope.vorschauBlatt = [];
        // Modal view
        $scope.imageSrc = '';
        $scope.moreInfosSettings = {
            isInHerbarium: false
        };
        // Map
        var geocoder = new google.maps.Geocoder();
        $scope.map = {
            center: {
                latitude: 45,
                longitude: -73
            },
            zoom: 8,
            dragging: false
        };

        // load Json
        Plants.all(function(plants) { // Plants json
            $scope.plants = plants;
            $scope.results = plants;

            // load all plants into lookup
            for (var i = 0, len = plants.length; i < len; i++) {
                plantIdsLookup[plants[i].SampleID] = plants[i];
            }
            $scope.updateNumbers();
            // Hier dinge testen
        });

        function reorderMenu(ebene2) {
            // Make loolup
            var lookup = {};
            for (var i = 0, len = ebene2.children.length; i < len; i++) {
                lookup[ebene2.children[i].name] = ebene2.children[i];
            }

            // return 
            var newOrder = [];

            // do it
            if (ebene2.name == "Wuchsform") {
                newOrder.push(lookup["Baum"]);
                newOrder.push(lookup["Kraut/Staude"]);
                ebene2.children = newOrder;
            }
            return ebene2;

        }

        MenuData.all(function(menuData) { // Menu data json
            // add random class
            for (var i = menuData.length - 1; i >= 0; i--) {
                var ebene1 = menuData[i];
                for (var j = ebene1.children.length - 1; j >= 0; j--) {
                    // in richtige reihenfolge bringen
                    var ebene2 = ebene1.children[j];
                    ebene1.children[j] = reorderMenu(ebene2);
                    ebene2.children.push({ // Unspezifische klasse hinzufügen
                        name: "fragezeichen"
                    })
                };
            };
            // Sort it and add random class
            var lookup = {};
            for (var i = 0, len = menuData.length; i < len; i++) {
                lookup[menuData[i].name] = menuData[i]; // Make Lookup 
            }
            var tmp = [];
            tmp.push(lookup["Ganze Pflanze"]);
            tmp.push(lookup["Blatt"]);
            tmp.push(lookup["Blüte"]);
            // set it
            $scope.menuData = tmp;
        });

        function contains(a, obj) {
            var i = a.length;
            while (i--) {
                if (a[i] === obj) {
                    return true;
                }
            }
            return false;
        }

        $scope.getImageName = function(data) {
                if (data.imageName == undefined) {
                    data.imageName = $scope.replaceAllSpecialCharactersInString(data.name);
                }
                return data.imageName;
            }
            // Selection logic
        $scope.menuSelectItem = function(child, parent, grandparent) {
            if (child.name == "fragezeichen") { // Handle fragezeichen
                child.selected = !child.selected;

                // change image to child image
                if (child.selected) {
                    // disable previous one if same category
                    if ($scope.selectedMerkmale[parent.name]) {
                        $scope.selectedMerkmale[parent.name].selected = false;
                        addRemove("remove", grandparent.name, $scope.selectedMerkmale[parent.name]);
                    }
                    // add to merkmale (for results)
                    if (!child.grandparent) child.grandparent = grandparent.name;
                    $scope.selectedMerkmale[parent.name] = child;

                    parent.imageName = $scope.getImageName(child);
                    parent.selected = true;
                } else {
                    parent.selected = false;
                    parent.imageName = $scope.replaceAllSpecialCharactersInString(parent.name);

                }
                updateResults();
                return;
            }

            child.selected = !child.selected;
            if (child.selected) { // add
                // disable previous one if same category
                if ($scope.selectedMerkmale[parent.name]) {
                    $scope.selectedMerkmale[parent.name].selected = false;
                    addRemove("remove", grandparent.name, $scope.selectedMerkmale[parent.name]);
                }
                // add to merkmale (for results)
                if (!child.grandparent) child.grandparent = grandparent.name;
                $scope.selectedMerkmale[parent.name] = child;

                // Change color
                if (parent.name == "Farbe") {
                    changeColorOfBlueteTo(child.name);
                } else {
                    // add to vorschau
                    addRemove("add", grandparent.name, child);
                }

                // change image to child image
                parent.imageName = $scope.getImageName(child);
                // invert image
                //invertMenuItem("#menuImg-"+$scope.replaceAllSpecialCharactersInString(parent.name));
                // select
                parent.selected = true;


            } else { // remove
                // remove stuff
                delete $scope.selectedMerkmale[parent.name];
                addRemove("remove", grandparent.name, child);
                parent.selected = false;

                // change color back to white
                if (parent.name == "Farbe") {
                    changeColorOfBlueteTo("weiß");
                }

                // change image back
                parent.imageName = $scope.replaceAllSpecialCharactersInString(parent.name);
            }

            updateResults();
        };

        // Change color to 
        function changeColorOfBlueteTo(color) {
                Caman("#vorschau-bild-mitte", function() {
                    if (color == "blau") {
                        this.colorize("#0000FF", 100).render();
                    } else if (color == "weiß") {
                        this.colorize("#FFFFFF", 100).render();
                    } else if (color == "gelb") {
                        this.colorize("#FFE4B5", 100).render();
                    } else if (color == "rosa") {
                        this.colorize("#FFC0CB", 100).render();
                    } else if (color == "violett") {
                        this.colorize("#8A2BE2", 100).render();
                    } else { // Weiß
                        this.colorize("#FFFFFF", 100).render();
                    }
                });
            }
            // Change color of supermenu
        function invertMenuItem(imageId) {
            //console.log(imageId);
            Caman(imageId, function() {
                this.invert().render();
            });
        }

        // repace all special characters in string
        $scope.replaceAllSpecialCharactersInString = function(string) {
            //console.log(string.replace(/[^a-zA-Z]+/, '').replace(/ /g, '').replace(/[äÄöÖüÜ]/g, ''));
            if (string == undefined) return "undefined";
            return string.replace(/[^a-zA-Z]+/, '').replace(/ /g, '').replace(/[äÄöÖüÜ]/g, '');
        }

        function updateResults() { // TODO make performant, should not calculate everything again every time
            if (Object.keys($scope.selectedMerkmale).length == 0) { // Keine selection, alle zeigen
                $scope.results = $scope.plants;
                $scope.updateNumbers();
                return;
            }

            // Get all plantids with weight
            var allIdsWithWeight = {};

            for (var key in $scope.selectedMerkmale) { // Mache liste mit allen plants und ihren summierten punkten
                var merkmal = $scope.selectedMerkmale[key];
                var arrayLength = merkmal.plantIds.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (!allIdsWithWeight[merkmal.plantIds[i]]) allIdsWithWeight[merkmal.plantIds[i]] = 0;
                    allIdsWithWeight[merkmal.plantIds[i]]++;
                }
            }

            // make results
            var results = [];

            for (var property in allIdsWithWeight) { // über alle gewichteten pflanzen
                if (allIdsWithWeight.hasOwnProperty(property)) { // sonst checkt der alle (auch superklassen kram)
                    var plant = plantIdsLookup[property];
                    results.push(plant);
                }
            }
            // Sort by weight
            results.sort(function(a, b) { // UNTESTED
                return allIdsWithWeight[b.SampleID] - allIdsWithWeight[a.SampleID];
            });

            $scope.results = results;
            $scope.updateNumbers();

        }

        function addRemove(type, name, object) {
            if (type == "add") {
                if (name == "Ganze Pflanze") {
                    $scope.vorschauLebensform.push(object);
                } else if (name == "Blüte") {
                    $scope.vorschauBluete.push(object);
                } else if (name == "Kopf") {
                    $scope.vorschauKopf.push(object);
                } else if (name == "Blatt") {
                    $scope.vorschauBlatt.push(object);
                }
            } else { // remove
                if (name == "Ganze Pflanze") {
                    remove($scope.vorschauLebensform, object);
                } else if (name == "Blüte") {
                    remove($scope.vorschauBluete, object);
                } else if (name == "Kopf") {
                    remove($scope.vorschauKopf, object);
                } else if (name == "Blatt") {
                    remove($scope.vorschauBlatt, object);
                }

            }

        };

        function remove(arr, item) {
            for (var i = arr.length; i--;) {
                if (arr[i] === item) {
                    arr.splice(i, 1);

                }
            }
        }

        function searchPlant(name) {
            function containsTextInAnyProperty(plant) {
                for (var property in plant) {
                    if (plant.hasOwnProperty(property)) {
                        if (property != "BasisOfRecord" ||  
                            property != "InstitutionCode" ||
                            property != "CollectionCode" ||
                            property != "CatalogNumber" ||
                            property != "Family" ||
                            property != "Country" ||
                            property != "associatedMedia") {
                            if (typeof(plant[property]) == 'string') {
                                if (plant[property].toLowerCase().includes(name.toLowerCase())) {
                                    plant.foundProperty = plant[property];
                                    return true;
                                }
                            }

                        }


                    }
                }
                plant.foundProperty = "";
                return false;
            }
            return $scope.plants.filter(containsTextInAnyProperty);
        }

        function searchTrait(trait) {
            var result = -1;
            var results = new Array([0]);
            for (plant in $scope.plants) {
                //Zugriff auf Merkmale von Pflanzen?
                if (plant.merkmale.search(trait) != -1) {
                    results = results.concat(results, new Array([plant]));
                }
            }
        }

        $scope.getRandomPlant = function() {
            var len = $scope.plants.length;
            var randNr = Math.floor((Math.random() * len));
            var randPlant = $scope.plants[randNr];
            //console.log(new String("Getting random plant: $scope.plants[") + randNr + new String("]: ") + randPlant.ScientificName);
            return randPlant;
        }

        // Herbarium
        $scope.putPlantIntoHerbariumOrRemove = function(plantId) {
            if (!$scope.herbariumContains(plantId)) {
                PlantStorage.saveToHerbarium(plantId);
            } else {
                PlantStorage.removeFromHerbarium(plantId);
            }
        }
        $scope.herbariumContains = function(plantId) {
            return PlantStorage.inHerbarium(plantId);
        }

        $scope.wortsucheEnable = function() {

            $scope.resultMode = "SearchResults";
            $scope.openSearchModal();
            $scope.hideFloradexOverlay();
            $scope.closeDrawer();
            $scope.closeModal();
            $scope.search.text(_text);
        }

        $scope.baukastenEnable = function() {
            $scope.hideSearchModal();
            $scope.hideFloradexOverlay();
            $scope.closeDrawer();
            $scope.results = $scope.plants;
            $scope.resultMode = "Baukasten";
            updateResults();
        }

        $scope.herbariumShow = function() {
            $scope.hideSearchModal();
            $scope.hideFloradexOverlay();
            $scope.closeDrawer();
            // get all plants
            var results = [];
            var herbarium = PlantStorage.loadHerbarium();
            console.log(herbarium)
            for (var i = herbarium.length - 1; i >= 0; i--) {
                var currentPlantId = herbarium[i];
                var plant = plantIdsLookup[currentPlantId];
                if (plant) {
                    results.push(plant);
                }
            };
            $scope.resultMode = "MeinHerbarium";
            $scope.results = results;
            $scope.updateNumbers();
        }

        // Popover
        $ionicPopover.fromTemplateUrl('my-popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.showMenuPopover = function($event, data, superMenuData) {
            $scope.currentPopoverMenuItem = data;
            data.hightlighted = true;
            $scope.currentPopoverMenuSuperItem = superMenuData;
            $scope.popover.show($event);
        };

        $scope.closePopover = function() {
            $scope.popover.hide();
        };

        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
        $scope.$on('popover.hidden', function() {

            $scope.currentPopoverMenuItem.hightlighted = false;
            $scope.currentPopoverMenuItem = null; // TODO
        });
        $scope.$on('popover.removed', function() {
            // Execute action
        });


        // Results View
        $scope.padding = 5;

        var jumps = [0, 5, 30, 60] // Die sprünge 
        $scope.updateNumbers = function() {
            $scope.countOfResults = $scope.results.length;
            if ($scope.countOfResults >= jumps[0] && $scope.countOfResults < jumps[1]) {
                $scope.resultsScaleTo(200);
            } else if ($scope.countOfResults >= jumps[1] && $scope.countOfResults < jumps[2]) {
                $scope.resultsScaleTo(100);
            } else if ($scope.countOfResults >= jumps[2] && $scope.countOfResults < jumps[3]) {
                $scope.resultsScaleTo(50);
            } else {
                $scope.resultsScaleTo(25);
            }
        }

        $scope.resultsScaleTo = function(scale) {
            $scope.resultSettings.size = scale;
            $ionicScrollDelegate.$getByHandle("resultsScrollView").resize();
            // http://ionicframework.com/docs/api/service/$ionicScrollDelegate/
        }



        // Modal image view
        $ionicModal.fromTemplateUrl('image-modal.html', {
            id: '1',
            scope: $scope,
            animation: 'slide-in-right',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modal = modal;
        });

        // Modal floradex image
        $ionicModal.fromTemplateUrl('flodarex-intro.html', {
            id: '2',
            scope: $scope,
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalFloradexImage = modal;
            if (showModalViewsOnStartup) {
                $scope.modalFloradexImage.show();
                $scope.toggleDrawer();
            }
        });

        // modal search
        $ionicModal.fromTemplateUrl('search.html', {
            id: '4',
            scope: $scope,
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalSearch = modal;
        });

        // modal fullscreen
        $ionicModal.fromTemplateUrl('image-fullscreen.html', {
            id: '3',
            scope: $scope,
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalFullscreenImage = modal;
        });



        // show modals
        $scope.openModal = function() {
            //$scope.modalFloradexImage.show();
            $scope.modal.show();
        };

        $scope.openFullscreenModal = function(plant) {
            $scope.modalFullscreenImage.show();
            var initialZoomForFullscreenImage = 0.3;
            $ionicScrollDelegate.$getByHandle('fullscreenScrollview').zoomBy(initialZoomForFullscreenImage);
        };

        $scope.openSearchModal = function(plant) {
            $scope.modalSearch.show();
        };

        // close modals
        $scope.closeModal = function() {
            $scope.modal.hide();
            if ($scope.resultMode == "SearchResults") {
                $scope.openSearchModal();
            }
            if ($scope.currentMoreInfoPlant != undefined) $scope.currentMoreInfoPlant.isShownInModalView = false; // gelbe umrandung
        };
        $scope.hideFloradexOverlay = function(plant) {
            $scope.modalFloradexImage.hide();
        }

        $scope.hideSearchModal = function(disableSearchMode) {
            if (disableSearchMode != undefined && disableSearchMode == true) {
                $scope.resultMode = "Baukasten";
            }
            $scope.modalSearch.hide();
        }
        $scope.hideFullscreenImageOverlay = function(plant) {
                $scope.modalFullscreenImage.hide();
                $scope.openModal(); // little hack, do not remove! 
            }
            //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
            $scope.modalFloradexImage.remove();
            $scope.modalFullscreenImage.remove();
            $scope.modalSearch.remove();
        });

        // Check if shown
        var modalShown = false;
        $scope.$on('modal.hidden', function() {
            modalShown = false;
        });
        $scope.$on('modal.shown', function() {
            modalShown = true;
        });

        $scope.showImage = function(plant) {
            if ($scope.resultMode == "SearchResults") {
                $scope.hideSearchModal();
                $scope.openModal();
            }


            if ($scope.currentMoreInfoPlant != undefined) $scope.currentMoreInfoPlant.isShownInModalView = false;
            plant.isShownInModalView = true; // gelbe umrandung
            $scope.currentMoreInfoPlant = plant;
            $scope.moreInfosSettings.isInHerbarium = $scope.herbariumContains(plant.SampleID);
            if ($scope.currentMoreInfoPlant.associatedMedia != "" && !modalShown) {
                $scope.openModal();
            }
            if (plant.geo != undefined) { // our geo
                $scope.mapTo(plant.geo);
            } else { // Herbarium geo
                var result = plant.Locality.search("Unknown");
                if (result > -1) {
                    $scope.map.zoom = 1;
                    $scope.mapTo("Central Europe");
                } else {
                    $scope.map.zoom = 4;
                    $scope.mapTo(plant.Locality);
                }
            }


        }

        // Maps stuff
        $scope.mapTo = function(address) {
            //console.log(address);
            geocoder.geocode({
                "address": address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                    var location = results[0].geometry.location;
                    //console.log(location);
                    $scope.map.center = {
                        latitude: location.A,
                        longitude: location.F
                    };
                    //$scope.map.refresh(); 
                    //$scope.myMap.panTo(location);
                }
            });
        }

        // search
        var _text;
        $scope.search = {
            text: function(newText) {
                if (newText == "") {
                    for (var i = $scope.plants.length - 1; i >= 0; i--) {
                        $scope.plants[i].foundProperty = "";
                    };
                } else if (newText != undefined) { // On every text change

                    $scope.results = searchPlant(newText);
                    $scope.resultMode = "SearchResults"; // or "MeinHerbarium" or "SearchResults"
                    $scope.updateNumbers();

                }
                return arguments.length ? (_text = newText) : _text;
            }
        };

    })
    .directive('errSrc', function() { // change image source on error
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function() {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    });
