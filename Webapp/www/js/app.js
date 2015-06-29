angular.module('floradex', ['ionic', 'ionic.contrib.drawer', 'uiGmapgoogle-maps', 'angular-underscore'])
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
                //console.log(new String("Trying to load plants from storage...") + "");
                var plantString = window.localStorage.getItem('plants');
                if (plantString) {
                    // console.log(plantString.split(";"));
                    return plantString.split(";");
                }
                //console.log(new String("no data in storage found") + "");
                return [];
            },
            saveToHerbarium: function(plant) {
                var savedPlants = window.localStorage.getItem('plants');
                if (savedPlants) {
                    // check if plant is already in herbarium
                    //console.log(new String("Plants in own herbarium: ") + savedPlants);
                    var result = savedPlants.search(plant);
                    if (result == -1) {
                        //console.log(new String("Adding plant ") + plant);
                        window.localStorage.setItem('plants', savedPlants + ";" + plant);
                    } else {
                        //console.log(new String("Plant ") + plant + " already in herbarium");
                    }
                } else {
                    //console.log(new String("Saving plant ") + plant + new String(" in empty storage"));
                    window.localStorage.setItem('plants', plant);
                }
            },
            loadHerbarium: function() {
                var tempPlants = window.localStorage.getItem('plants');
                if (tempPlants) {
                    var plants = tempPlants.split(";");
                    //console.log(plants);
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
                var tempPlants = window.localStorage.getItem('plants');
                if (tempPlants) {
                    var plants = tempPlants.split(";");
                    var indexOfPlant = plants.indexOf(plantID);
                    plants.splice(indexOfPlant, 1);
                    var temp = "";
                    for (plant in plants) {
                        temp += plant + ";";
                    }
                    window.localStorage.setItem('plants', temp);
                    //console.log("removed:" + temp)
                }
            }
        }
    })

.controller('MainCtrl', function($ionicSideMenuDelegate, $scope, $ionicScrollDelegate, $ionicPopover, $ionicModal, Plants, MenuData, PlantStorage) { // $ionicPopover,
        // debugging:
        var showModalViewsOnStartup = false;
        // setup
        ionic.Platform.ready(function() {
            $ionicSideMenuDelegate.canDragContent(false);
        });

         var allNames = ["Anne Lange", "Paul Michaelis", "Philipp Schroeter", "Immanuel Pelzer"];
            allNames = _.shuffle(allNames);
       $scope.getAllNamesInRandom = function() { 
           
            return allNames[0] + ", " + allNames[1] + ", " + allNames[2] + ", " + allNames[3];
        }

        // vars
        var plantIdsLookup = {};
        $scope.ganzePflanzeBg = "empty_ganz";
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
            control: {},
            center: {
                latitude: 5.820226,
                longitude: 24.848831
            },
            zoom: 0,
            options: {
                disableDefaultUI: true,
                draggable: false,
                zoomControl: false,
                disableDoubleClickZoom: true,
                styles: [{
                    "featureType": "administrative",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }]
            },
            refresh: function() {
                $scope.map.control.refresh(origCenter);
            }
        };
        var origCenter = {
            latitude: $scope.map.center.latitude,
            longitude: $scope.map.center.longitude
        };


        // load Json
        Plants.all(function(plants) { // Plants json
            $scope.plants = plants;
            $scope.results = plants;

            // load all plants into lookup
            for (var i = 0, len = plants.length; i < len; i++) {
                plantIdsLookup[plants[i].SampleID] = plants[i];
                //console.log(plants[i].SampleID)
            }
            $scope.updateNumbers();
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
                newOrder.push(lookup["Strauch"]);
                newOrder.push(lookup["Kraut/Staude"]);
                newOrder.push(lookup["Wasserpflanze"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Querschnitt der Sprossachse") {
                newOrder.push(lookup["rundspross"]);
                newOrder.push(lookup["kantig"]);
                newOrder.push(lookup["gerillt"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Stellung an der Sprossachse") {
                newOrder.push(lookup["gegenständig"]);
                newOrder.push(lookup["wechselständig"]);
                newOrder.push(lookup["kreuzgegenständig"]);
                newOrder.push(lookup["quirlständig"]);
                newOrder.push(lookup["grundständig"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Blattgrund") {
                newOrder.push(lookup["sitzend"]);
                newOrder.push(lookup["gestielt"]);
                newOrder.push(lookup["stengelumfassend"]);
                newOrder.push(lookup["verwachsen"]);
                newOrder.push(lookup["scheidig verwachsen"]);
                ebene2.children = newOrder;
            }

            if (ebene2.name == "Gliederung") {
                newOrder.push(lookup["einfach"]);
                newOrder.push(lookup["dreizählig gefiedert"]);
                newOrder.push(lookup["dreizählig gespalten"]);
                newOrder.push(lookup["handförmig gespalten"]);
                newOrder.push(lookup["handförmig getrennt"]);
                newOrder.push(lookup["fiederschnittig"]);
                newOrder.push(lookup["gefiedert"]);
                newOrder.push(lookup["unpaarig gefiedert"]);
                newOrder.push(lookup["doppelt gefiedert"]);
                newOrder.push(lookup["dreifach gefiedert"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Blattform") {
                newOrder.push(lookup["rund"]);
                newOrder.push(lookup["oval"]);
                newOrder.push(lookup["lanzettlich"]);
                newOrder.push(lookup["spatelelig"]);
                newOrder.push(lookup["lineal"]);
                newOrder.push(lookup["herzförmig"]);
                newOrder.push(lookup["nierenförmig"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Blattrand") {
                newOrder.push(lookup["ganzrandig"]);
                newOrder.push(lookup["gezähnt"]);
                newOrder.push(lookup["gekerbt"]);
                newOrder.push(lookup["gebuchtet"]);
                newOrder.push(lookup["gesägt"]);
                newOrder.push(lookup["gelappt"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Blattnerven") {
                newOrder.push(lookup["einnervig"]);
                newOrder.push(lookup["kreuz-geadert"]);
                newOrder.push(lookup["gabelnervig"]);
                newOrder.push(lookup["parallelnervig"]);
                newOrder.push(lookup["in den Blattrand auslaufend"]);
                //newOrder.push(lookup["netznervig"]);
                ebene2.children = newOrder;
            }

            if (ebene2.name == "Farbe") {
                newOrder.push(lookup["weiß"]);
                newOrder.push(lookup["gelb"]);
                newOrder.push(lookup["orange"]);
                newOrder.push(lookup["rot"]);
                newOrder.push(lookup["rosa"]);
                newOrder.push(lookup["violett"]);
                newOrder.push(lookup["blau"]);
                newOrder.push(lookup["grün"]);
                newOrder.push(lookup["braun"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Blütenorientierung") {
                newOrder.push(lookup["aufrecht"]);
                newOrder.push(lookup["nickend"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Form/Symmetrie") {
                newOrder.push(lookup["radförmig dreizählig"]);
                newOrder.push(lookup["radförmig vierzählig"]);
                newOrder.push(lookup["radförmig fünfzählig"]);
                newOrder.push(lookup["radförmig sechszählig"]);
                newOrder.push(lookup["radförmig vielzählig"]);
                newOrder.push(lookup["röhrenförmig"]);
                newOrder.push(lookup["trichterförmig"]);
                ebene2.children = newOrder;
            }
            if (ebene2.name == "Anordnung") {
                newOrder.push(lookup["einzeln"]);
                newOrder.push(lookup["Wickel"]);
                newOrder.push(lookup["Körbchen"]);
                newOrder.push(lookup["Köpfchen"]);
                newOrder.push(lookup["Dolde"]);
                newOrder.push(lookup["Traube"]);
                newOrder.push(lookup["Ähre"]);
                newOrder.push(lookup["Rispe"]);
                ebene2.children = newOrder;
            }
            return ebene2;

        }

        $scope.popoverTextForMerkmal = function(merkmal) {
            if (merkmal == "Wuchsform") return " Welche Wuchsform hat die Pflanze? ";
            else if (merkmal == "Querschnitt der Sprossachse") return " Welche Form hat der Querschnitt des Stengels? ";
            else if (merkmal == "Stellung an der Sprossachse") return " Wie sind die Blätter am Stengel angeordnet? ";
            else if (merkmal == "Blattgrund") return " Wie sind die Blätter mit dem Stengel verbunden? ";
            else if (merkmal == "Gliederung") return " Wie sind die Blätter an der Hauptachse angeordnet? ";
            else if (merkmal == "Blattform") return " Welche Form hat die Fläche der Blätter? ";
            else if (merkmal == "Blattrand") return " Wie ist der Rand der Blätter beschaffen? ";
            else if (merkmal == "Blattnerven") return " Welche Struktur haben die Adern der Blätter? ";
            else if (merkmal == "Farbe") return " Welche Färbung haben die Blüten? ";
            else if (merkmal == "Blütenorientierung") return " In welche Richtung zeigen die Blüten? ";
            else if (merkmal == "Form/Symmetrie") return " Wie sehen die einzelnen Blüten aus? ";
            else if (merkmal == "Anordnung") return " Auf welche Weise sind die einzelnen Blüten angeordnet? ";
            else {
                return "Keine Beschreibung"
            }
        }

        MenuData.all(function(menuData) { // Menu data json
            // add random class
            for (var i = menuData.length - 1; i >= 0; i--) {
                var ebene1 = menuData[i];
                for (var j = ebene1.children.length - 1; j >= 0; j--) {
                    var ebene2 = ebene1.children[j];
                    ebene1.children[j] = reorderMenu(ebene2);
                    ebene2.children.push({ // push trait 'unknown'
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

        $scope.baukastenRemoveAllFilters = function() {
            var keys = _.keys($scope.selectedMerkmale);
            for (var i = keys.length - 1; i >= 0; i--) {
                var key = keys[i];
                var value = $scope.selectedMerkmale[key];
                value.parent.selected = false;
            };
            $scope.vorschauLebensform = [];
            $scope.vorschauBluete = [];
            $scope.vorschauKopf = [];
            $scope.vorschauBlatt = [];
            $scope.selectedMerkmale = {};
            updateResults();
            $scope.toggleDrawer();
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
                    if (!child.parent) child.parent = parent;
                    //$scope.selectedMerkmale[parent.name] = child;

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
                if (!child.parent) child.parent = parent;
                $scope.selectedMerkmale[parent.name] = child;


                // Set index
                child.index = $scope.currentPopoverMenuItem.index;
                
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

                // Wuchsform hack
                if (parent.name == "Wuchsform") {
                    $scope.ganzePflanzeBg = "Wuchsform";
                } 

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

                // wuchsform hack
                if (parent.name == "Wuchsform") {
                    $scope.ganzePflanzeBg = "empty_ganz";
                }
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
                        this.colorize("#FFF200", 100).render();
                    } else if (color == "rosa") {
                        this.colorize("#C975B0", 100).render();
                    } else if (color == "violett") {
                        this.colorize("#5A2B68", 100).render();
                    }else if (color == "orange") {
                        this.colorize("#F38030", 100).render();
                    }else if (color == "blau") {
                        this.colorize("#03436E", 100).render();
                    }else if (color == "grün") {
                        this.colorize("#00A04E", 100).render();
                    }else if (color == "braun") {
                        this.colorize("#635847", 100).render();
                    } else if (color == "rot") {
                        this.colorize("#B82025", 100).render();
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
            if (Object.keys($scope.selectedMerkmale).length == 0) { // if none is selected, show all
                $scope.results = $scope.plants;
                $scope.updateNumbers();
                return;
            }

            // Get all plantIDs with weight
            var allIdsWithWeight = {};

            for (var key in $scope.selectedMerkmale) { //create a list with all plants and their cumulated points
                var merkmal = $scope.selectedMerkmale[key];
                var arrayLength = merkmal.plantIds.length;
                for (var i = 0; i < arrayLength; i++) {
                    if (!allIdsWithWeight[merkmal.plantIds[i]]) allIdsWithWeight[merkmal.plantIds[i]] = 0;
                    allIdsWithWeight[merkmal.plantIds[i]]++;
                }
            }

            // make results
            var results = [];

            for (var property in allIdsWithWeight) { // iterate over all weighted plants
                if (allIdsWithWeight.hasOwnProperty(property)) {
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
                        if (property == "ScientificName" ||  
                            property == "HigherGeography" ||
                            property == "title" ||
                            property == "volksname" ||
                            property == "distribution" ||
                            property == "geo") {
                            if (typeof(plant[property]) == 'string') {
                                if (_.includes(plant[property].toLowerCase(), name.toLowerCase())) {
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
            //console.log(herbarium)
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
            //$ionicScrollDelegate.$getByHandle('popoverScroller').getScrollView().options.scrollingY = false;
            //http://forum.ionicframework.com/t/how-to-disable-content-scrolling/238/19
        });

        $scope.showMenuPopover = function($event, data, superMenuData, index) {
            $scope.currentPopoverMenuItem = data;
            $scope.currentPopoverMenuItem.index = index;
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
            //$scope.currentPopoverMenuItem = null;
        });
        $scope.$on('popover.removed', function() {
            // Execute action
        });


        // Results View
        $scope.padding = 5;

        var jumps = [0, 5, 30, 60] // amount when results are shown different
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
            animation: 'none',
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

        $scope.isMoreInfosViewOpen = function() {
            return $scope.modal.isShown();
        }
        $scope.isModalFloradexImageOpen = function() {
            return $scope.modalFloradexImage.isShown();
        }


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

        // More info

        $scope.showImage = function(plant) {
           // console.log(plant.SampleID)
            if ($scope.resultMode == "SearchResults") {
                $scope.hideSearchModal();
                $scope.openModal();
            }
           // console.log(plant.SampleID)

            if ($scope.currentMoreInfoPlant != undefined) $scope.currentMoreInfoPlant.isShownInModalView = false;
            plant.isShownInModalView = true; // gelbe umrandung
            $scope.currentMoreInfoPlant = plant;
            $scope.moreInfosSettings.isInHerbarium = $scope.herbariumContains(plant.SampleID);
            if ($scope.currentMoreInfoPlant.associatedMedia != "" && !modalShown) {
                $scope.openModal();
            }
            if (plant.geo != undefined) { // our geo
                $scope.mapTo(plant);
            }


        }

        $scope.currentPlantContainsMerkmalImageName = function(plant, merkmal) { // code from hell
            // for (var key in $scope.selectedMerkmale) {
            //     // key = Stellung an der sprossenachse
            //     if (key = merkmal.name) {
            //         var val = $scope.selectedMerkmale[key];
            //         if (val != undefined) {
            //             if (_.contains(plant.merkmale, val.name)) {
            //                 return true;
            //             }
            //         }
            //     }
            // }
            if (_.contains(_.keys(plant.merkmale), merkmal.name)) {
                // console.log($scope.replaceAllSpecialCharactersInString(plant.merkmale[merkmal.name]));
                return $scope.replaceAllSpecialCharactersInString(plant.merkmale[merkmal.name]);
            } else {
                return $scope.replaceAllSpecialCharactersInString(merkmal.name);
            }
        }

        $scope.currentPlantMerkmalName = function(plant, merkmal) {
            if (_.contains(_.keys(plant.merkmale), merkmal.name)) {
                // console.log($scope.replaceAllSpecialCharactersInString(plant.merkmale[merkmal.name]));
                return plant.merkmale[merkmal.name];
            } else {
                return 'n/a';
            }

        }

        $scope.currentPlantContainsMerkmal = function(plant, merkmal) { // code from hell
            // for (var key in $scope.selectedMerkmale) {
            //     // key = Stellung an der sprossenachse
            //     if (key = merkmal.name) {
            //         var val = $scope.selectedMerkmale[key];
            //         if (val != undefined) {
            //             if (_.contains(plant.merkmale, val.name)) {
            //                 return true;
            //             }
            //         }
            //     }
            // }
            return _.contains(_.keys(plant.merkmale), merkmal.name);
        }

        // Maps stuff
        $scope.mapTo = function(plant) {
            if (plant.marker1_lat == undefined || plant.marker1_lat == "") {
                $scope.map.marker1 = null;
            } else {
                $scope.map.marker1 = {
                    latitude: plant.marker1_lat,
                    longitude: plant.marker1_long
                };
            }

            if (plant.marker2_lat == undefined || plant.marker2_lat == "") {
                $scope.map.marker2 = null;
            } else {
                $scope.map.marker2 = {
                    latitude: plant.marker2_lat,
                    longitude: plant.marker2_long
                };
            }

            if (plant.marker3_lat == undefined || plant.marker3_lat == "") {
                $scope.map.marker3 = null;
            } else {
                $scope.map.marker3 = {
                    latitude: plant.marker3_lat,
                    longitude: plant.marker3_long
                };
            }
            if (plant.marker4_lat == undefined || plant.marker4_lat == "") {
                $scope.map.marker4 = null;
            } else {
                $scope.map.marker4 = {
                    latitude: plant.marker4_lat,
                    longitude: plant.marker4_long
                };
            }
            if (plant.marker5_lat == undefined || plant.marker5_lat == "") {
                $scope.map.marker5 = null;
            } else {
                $scope.map.marker5 = {
                    latitude: plant.marker5_lat,
                    longitude: plant.marker5_long
                };
            }

            $scope.map.refresh();
            //console.log(address);
            // geocoder.geocode({
            //     "address": address
            // }, function(results, status) {
            //     if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
            //         var location = results[0].geometry.location;
            //         //console.log(location);
            //         $scope.map.center = {
            //             latitude: location.A,
            //             longitude: location.F
            //         };
            //         //$scope.map.refresh(); 
            //         //$scope.myMap.panTo(location);
            //     }
            // });
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

        // title
        $scope.getCurrentTitle = function() {
            if ($scope.resultMode == "Baukasten") {
                return "Pflanzenbestimmung";
            } else if ($scope.resultMode == "MeinHerbarium") {
                return "Mein Herbarium";
            } else if ($scope.resultMode == "SearchResults") {
                return "Wortsuche";
            } else {
                return "floradex";
            }
        }


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
