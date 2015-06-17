FiveInRowGameApp.controller('MainCtrl', ['$scope', 'GameSystem', 'Socket', function ($scope, GameSystem, Socket) {
        $scope.playerName;
        $scope.resetCtrl = function () {
            GameSystem.isGameStarted = false;
            GameSystem.isWaitingForSecondPlayer = false;
            $scope.isConfigurePrivateGameMode = false;
            $scope.message = null;
            $scope.isGreetingMessageActive = true;
            $scope.isWaitingForSecondPublicPlayer = false;
            $scope.isWaitingForResponse = false;
            Socket.setKeepConnection(false);
            $scope.$parent.pageTitle = "Five in row game";
        };

        $scope.resetCtrl();

        $scope.isWaitingForSecondPlayer = function () {
            return GameSystem.isWaitingForSecondPlayer;
        };

        Socket.disconnect(); //it is posible, that old game connection are still open
        Socket.setWorkScope($scope);
        
        
        $scope.configurePublicGame = function () {
            $scope.isGreetingMessageActive = false;
            $scope.isConfigurePublicGameMode = true;
        };
        
        $scope.createPublicGame = function () {
            $scope.isConfigurePublicGameMode = false;
            Socket.connect();
            GameSystem.playerName = $scope.playerName;
            $scope.isWaitingForSecondPublicPlayer = true;
            
            Socket.setOnOpenEvent(function () {
                Socket.send(JSON.stringify({
                    command: 'CreateOrJoinPublicGame',
                    parameters: {playerName: $scope.playerName}
                }));
            });
            
        }; 
        
        $scope.configurePrivateGame = function () {
            $scope.isGreetingMessageActive = false;
            $scope.isConfigurePrivateGameMode = true;
        };
        
        $scope.createPrivateGame = function () {
            $scope.isConfigurePrivateGameMode = false;
            Socket.connect();
            GameSystem.playerName = $scope.playerName;
            $scope.isWaitingForResponse = true;
            Socket.setOnOpenEvent(function () {
                Socket.send(JSON.stringify({
                    command: 'CreatePrivateGame',
                    parameters: {playerName: $scope.playerName}
                }));
            });
        };

        $scope.createGameVsAI = function () {
            Socket.connect();

            Socket.setOnOpenEvent(function () {
                Socket.send(JSON.stringify({
                    command: 'CreateGameVsAI',
                    parameters: {}
                }));
            });
        };

        $scope.isGreetingMessageShowed = function () {
            return $scope.isGreetingMessageActive;
        };



    }]);
