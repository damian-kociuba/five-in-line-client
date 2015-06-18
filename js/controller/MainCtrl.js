FiveInRowGameApp.controller('MainCtrl', ['$scope', 'GameSystem', 'Socket', function ($scope, GameSystem, Socket) {
        console.log('main contr');
        $scope.playerName;
        $scope.resetCtrl = function () {
            console.log('reset');
            GameSystem.isGameStarted = false;
            GameSystem.isWaitingForSecondPlayer = false;
            $scope.isWaitingForSecondPlayer = false;
            $scope.GameSystem = GameSystem;
            GameSystem.isWaitingForSecondPublicPlayer = false;

            GameSystem.isPlayerTurn = false;
            GameSystem.isGameFinished = false;

            $scope.isConfigurePrivateGameMode = false;
            $scope.isConfigurePublicGameMode = false;
            $scope.message = null;
            $scope.isGreetingMessageActive = true;
            $scope.isWaitingForResponse = false;
            Socket.setKeepConnection(false);
            $scope.$parent.pageTitle = "Five in row game";
        };

        $scope.resetCtrl();

        $scope.isWaitingForSecondPlayer = function () {
            return GameSystem.isWaitingForSecondPlayer;
        };
        /*$scope.isWaitingForSecondPublicPlayer = function () {
            console.log('waiting');
            console.log(GameSystem.isWaitingForSecondPublicPlayer);
            console.log(GameSystem);
            console.log(GameSystem.isWaitingForSecondPublicPlayer);
            var tmp = GameSystem;
            console.log(tmp);
            return tmp.isWaitingForSecondPublicPlayer;
            return GameSystem.isWaitingForSecondPublicPlayer;
        };*/

        Socket.disconnect(); //it is posible, that old game connection are still open
        Socket.setWorkScope($scope);


        $scope.configurePublicGame = function () {
            $scope.isGreetingMessageActive = false;
            $scope.isConfigurePublicGameMode = true;
            console.log(GameSystem);
            GameSystem.isWaitingForSecondPublicPlayer = false;
        };

        $scope.createPublicGame = function () {
            
            $scope.isConfigurePublicGameMode = false;
            Socket.connect();
            GameSystem.playerName = $scope.playerName;
            console.log('waiting for second player - true');
            GameSystem.isWaitingForSecondPublicPlayer = true;
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
