teamapp.controller( 'fantasyteamcontroller', ['$scope', '$http', 'datafactory', 'uiGridConstants',
    function($scope, $http, datafactory, uiGridConstants) {
        $scope.loadplayerslist = function() {
            $scope.loadDefaults();
            datafactory.getPlayers().then(function(response) {
                $scope.playerlist = response.data;
                $scope.setPlayersList();
            }, function(reject) {

            });
        };
        $scope.setPlayersList = function() {
            $scope.playerselectionoptions.data = $scope.playerlist;
            // $scope.playerselectionoptions.multiSelect = true;
            // $scope.playerselectionoptions.enableRowSelection = true;
        };
        $scope.loadDefaults = function() {
            $scope.playerselectionoptions = {};
            $scope.playerselectionoptions = {
                enableRowSelection: true,
                enableRowHeaderSelection: false
            };
            $scope.playerlistfilter = {
                filtertext: ''
            };
            $scope.playerselectionoptions.onRegisterApi = function( gridapi ) {
                $scope.playerselectiongridapi = gridapi;
            };
            $scope.selectedplayercost = 0;
            $scope.costbound = 100;
            $scope.selectedplayersgrid = {
                data : [],
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                onRegisterApi : function( gridapi ) {
                    $scope.deselectplayersgridapi = gridapi;
                },
                enableSorting: false,
                enableRowReordering: true
            };
            $scope.playertypecount = {
                "goalkeeper": 0,
                "defender": 0,
                "midfielder": 0,
                "striker":0
            };
        };
        $scope.selectPlayers = function() {
            var playerlist = $scope.playerselectiongridapi.selection.getSelectedRows(),
                playeriterator = 0,
                rawplayerslist = $scope.playerselectionoptions.data,
                rawplayeriterator = 0;
            $scope.isPlayerSelectionValid();
            if($scope.validate.error === false) {
                // move players
                for (playeriterator = 0; playeriterator < playerlist.length; playeriterator++) {
                    for (rawplayeriterator = 0; rawplayeriterator < rawplayerslist.length; rawplayeriterator++) {
                        if(playerlist[playeriterator].$$hashKey === rawplayerslist[rawplayeriterator].$$hashKey) {
                            $scope.playertypecount[playerlist[playeriterator].role]++;
                            $scope.selectedplayersgrid.data.push(playerlist[playeriterator]);
                            $scope.playerselectionoptions.data.splice(rawplayeriterator, 1);
                        }
                    }
                }
            } else {
            }
        };
        $scope.deSelectPlayers = function() {
            //step 1 get all selected rows
            var deselectplayerslist = $scope.deselectplayersgridapi.selection.getSelectedRows(),
                length = deselectplayerslist.length,
                deselectplayeriterator = 0,
                allselectedplayerslist = $scope.selectedplayersgrid.data,
                selectedplayeriterator = 0;
            //step 2 run the loop over it and just push it onto original stack
            for (deselectplayeriterator = 0; deselectplayeriterator < length; deselectplayeriterator++) {
                $scope.playerselectionoptions.data.push(deselectplayerslist[deselectplayeriterator]);
                for (selectedplayeriterator = 0; selectedplayeriterator < $scope.selectedplayersgrid.data.length; selectedplayeriterator++) {
                    if(allselectedplayerslist[selectedplayeriterator].$$hashKey === deselectplayerslist[deselectplayeriterator].$$hashKey) {
                        $scope.playertypecount[allselectedplayerslist[selectedplayeriterator].role]--;
                        $scope.selectedplayersgrid.data.splice(selectedplayeriterator, 1);
                    }
                }
            }
        };
        $scope.isPlayerSelectionValid = function() {
            var playerlist = $scope.playerselectiongridapi.selection.getSelectedRows();
            $scope.validate = {};
            var length = playerlist.length;
            var playeriterator = 0;
            var totalcost = 0,
            temp_player_count = {
                "goalkeeper": {
                    "present": $scope.playertypecount.goalkeeper,
                    "min_required": 1
                },
                "defender": {
                    "present": $scope.playertypecount.defender,
                    "min_required": 3
                },
                "midfielder": {
                    "present": $scope.playertypecount.midfielder,
                    "min_required": 0
                },
                "striker": {
                    "present": $scope.playertypecount.striker,
                    "min_required": 1
                }
            },
            players_remaining = 15 - ($scope.selectedplayersgrid.data.length + length);
            $scope.validate.error = false;
            // Check if player is selected
            if(length === 0) {
                $scope.validate.error = true;
                $scope.validate.message = "Please select at least 1 player to move";
            } else if (players_remaining < 0) {
                // Check if in all more than 15 players are selectedItem
                $scope.validate.error = true;
                $scope.validate.message = "Cannot select more than 15 players";
            }  else {
                // Check it for players meeting up the constraint for goalkeeper, defender and strikers

                for ( playeriterator = 0; playeriterator < length; playeriterator++) {
                    totalcost += playerlist[playeriterator].value;
                    temp_player_count[playerlist[playeriterator].role].present++;
                }
                // goalkeeper Check
                if(temp_player_count.goalkeeper.min_required > temp_player_count.goalkeeper.present + players_remaining) {
                    $scope.validate.error = true;
                    $scope.validate.message = "Minimum 1 goalkeeper need to be selected";
                } else if(temp_player_count.defender.min_required > temp_player_count.defender.present + players_remaining) {
                    //defender check
                    $scope.validate.error = true;
                    $scope.validate.message = "Minimum 3 defenders need to be selected";
                } else if(temp_player_count.striker.min_required > temp_player_count.striker.present + players_remaining) {
                    // striker Check
                    $scope.validate.error = true;
                    $scope.validate.message = "Minimum 1 striker need to be selected";
                } else if(totalcost + $scope.selectedplayercost > 100) {
                    // Check if in all more than 15 players are selectedItem
                    $scope.validate.error = true;
                    $scope.validate.message = "Budget cannot be more than 100 million Euros";
                } else {
                    $scope.validate.message = "Players selected successfully";
                }
            }
            // Check if it is overbudget
            // return true or false

        };
        $scope.isValidationMessage = function() {
            if($scope.validate && $scope.validate.message) {
                return true;
            } else {
                return false;
            }
        };
        $scope.totalAmountSpent = function() {
            var players_list = $scope.selectedplayersgrid.data,
                selectedplayeriterator = 0,
                length = players_list.length;
            $scope.selectedplayercost = 0;
            for (selectedplayeriterator = 0; selectedplayeriterator < length; selectedplayeriterator++) {
                $scope.selectedplayercost = $scope.selectedplayercost + players_list[selectedplayeriterator].value;
            }
            return $scope.selectedplayercost;
        };
        $scope.makeTeamXI = function() {

        };
        $scope.arePlayersLessThan15 = function() {
            return $scope.selectedplayersgrid.data.length < 15;
        };
    }
]);
