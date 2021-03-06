FiveInRowGameApp.controller('GameCtrl', ['$scope', 'GameSystem', 'Socket', function ($scope, GameSystem, Socket) {
        $scope.secondPlayerLeftTheGame = false;
        $scope.playerWin = false;
        $scope.oponentWin = false;
        $scope.isNotPlayerTurnMessageShow = false;
        Socket.setKeepConnection(true);
        Socket.setWorkScope($scope);
        Socket.connect();

        $scope.isPlayerTurn = function () {
            return GameSystem.isPlayerTurn;
        };
        $scope.isGameValid = function () {
            return GameSystem.isGameStarted;
        };
        $scope.getBoard = function () {
            return GameSystem.board;
        };
        $scope.getPlayerColor = function () {
            return GameSystem.playerColor;
        };
        $scope.makeMove = function (x, y) {
            if (!GameSystem.isPlayerTurn) {
                $scope.isNotPlayerTurnMessageShow = true;
                return;
            }
            if (GameSystem.board.getByXY(x, y).type !== 'empty') {
                return;
            }
            GameSystem.board.setByXY(x, y, {type: GameSystem.playerColor});
            GameSystem.isPlayerTurn = false;
            console.log('Move to' + x + ', ' + y);
            Socket.send(JSON.stringify({
                command: 'MakeMove',
                parameters: {
                    x: x,
                    y: y
                }
            }));

        };


    }]);