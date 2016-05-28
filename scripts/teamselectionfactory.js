angular.module('teamapp')
    .factory('datafactory', ['$http', function($http) {
        var datafactory = {};
        datafactory.getPlayers = function () {
            return $http.get("data/raw_players.json");
        };
        return datafactory;
    }]);
