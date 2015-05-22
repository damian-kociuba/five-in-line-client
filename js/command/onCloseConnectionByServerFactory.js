FiveInRowGameApp.factory('OnCloseConnectionByServer', ['GameSystem', function (GameSystem) {
        var obj = {};
        obj.run = function ($scope) {
            if (GameSystem.isGameStarted) {
                GameSystem.isGameFinished = true;
                $scope.connectionClosedByServer = true;

            } else if (GameSystem.isWaitingForSecondPlayer) {

                $scope.message = {
                    type: 'error',
                    content: 'The waiting time has elapsed'
                };
            }
            $scope.$apply();
        };
        return obj;
    }]);