FiveInRowGameApp.controller('MainCtrl', ['$scope', 'GameSystem', 'Socket', function ($scope, GameSystem, Socket) {
        $scope.playerName;
        $scope.resetCtrl = function () {
            GameSystem.isGameStarted = false;
            GameSystem.isWaitingForSecondPlayer = false;
            $scope.isConfigurePrivateGameMode = false;
            $scope.message = null;
            $scope.isGreetingMessageActive = true;
            Socket.setKeepConnection(false);
        };

        $scope.resetCtrl();

        $scope.isWaitingForSecondPlayer = function () {
            return GameSystem.isWaitingForSecondPlayer;
        };

        Socket.disconnect(); //it is posible, that old game connection are still open
        Socket.setWorkScope($scope);
        $scope.configurePrivateGame = function () {
            $scope.isGreetingMessageActive = false;
            $scope.isConfigurePrivateGameMode = true;
        };
        $scope.createPrivateGame = function () {
            $scope.isConfigurePrivateGameMode = false;
            Socket.connect();
            GameSystem.playerName = $scope.playerName;
            
            Socket.setOnOpenEvent(function () {
                Socket.send(JSON.stringify({
                    command: 'CreatePrivateGame',
                    parameters: {playerName: $scope.playerName}
                }));
            });
        };

        $scope.isGreetingMessageShowed = function () {
            return $scope.isGreetingMessageActive;
        };



    }]);
