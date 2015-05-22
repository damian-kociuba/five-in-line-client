FiveInRowGameApp.controller('JoinToPrivateGameCtrl', ['$scope', '$routeParams', 'GameSystem', 'Socket', function ($scope, $routeParams, GameSystem, Socket) {
        GameSystem.isGameStarted = false;
        Socket.setKeepConnection(false);

        var gameHashValue = $routeParams.gameHash;

        $scope.joinToPrivateGame = function () {
            Socket.setWorkScope($scope);
            Socket.connect();
            var playerName = $scope.playerName;
            GameSystem.playerName = playerName;
            Socket.setOnOpenEvent(function () {
                Socket.send(JSON.stringify({
                    command: 'JoinToPrivateGame',
                    parameters: {
                        gameHash: gameHashValue,
                        playerName: playerName
                    }
                }));
            });

        };

    }]);