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
             else if (GameSystem.isWaitingForSecondPublicPlayer) {

                $scope.message = {
                    type: 'error',
                    content: 'There is nobody else to game. Please try later.'
                };
            }
            $scope.$apply();
        };
        return obj;
    }]);