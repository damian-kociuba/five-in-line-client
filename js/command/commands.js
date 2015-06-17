
FiveInRowGameApp.factory('onStartGameCommand', ['$location', 'GameSystem', function ($location, GameSystem) {

        var obj = {};
        obj.run = function ($scope, message) {
            console.log('second player joined! Lets play!');
            GameSystem.isPlayerTurn = message.parameters.isPlayerTurn;
            GameSystem.playerColor = message.parameters.playerColor;
            GameSystem.opponentName = message.parameters.opponentName;

            $scope.$parent.pageTitle = 'Five in row game - ' + GameSystem.playerName + ' vs. ' + GameSystem.opponentName;

            GameSystem.isGameStarted = true;
            GameSystem.board = new Board(20, 20);
            $scope.$apply(function () {
                $location.path("/game");
            });
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onPrivateGameCreatedCommand', ['GameSystem', function (GameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            $scope.newPrivateGameIsCreated = true;
            $scope.isWaitingForResponse = false;
            $scope.newPrivateGameJoinUrl = document.URL + 'join/' + message.parameters.gameHashId;
            $scope.isGreetingMessageActive = false;
            GameSystem.isWaitingForSecondPlayer = true;
            $scope.$apply();
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onMoveMadeCommand', ['GameSystem', function (GameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.log('Zrobiono ruch');
            var board = GameSystem.board;
            board.setByXY(message.parameters.x, message.parameters.y, {type: message.parameters.color});
            GameSystem.isPlayerTurn = message.parameters.isPlayerTurn;
            $scope.$apply();
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onFinishGameCommand', ['GameSystem', function (GameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.log(message);
            if (message.parameters.result === 'PlayerWin') {
                $scope.playerWin = true;
            } else if (message.parameters.result === 'OpponentWin') {
                $scope.opponentWin = true;
            } else {
                console.error('Unknow result of finishGameCommand');
            }
            GameSystem.isPlayerTurn = false;
            GameSystem.isGameFinished = true;
            $scope.$apply();
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onErrorCommand', ['GameSystem', function (GameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.error(message.parameters.message);
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onCloseGameCommand', ['GameSystem', '$location', function (GameSystem, $location) {
        var obj = {};
        obj.run = function ($scope, message) {
            if (GameSystem.isGameStarted) {
                GameSystem.isGameFinished = true;
                $scope.secondPlayerLeftTheGame = true;
                $scope.$apply();
            }
        };
        return obj;
    }]);
