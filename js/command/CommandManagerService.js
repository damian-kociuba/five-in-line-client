FiveInRowGameApp.service('CommandManager', ['$injector', function ($injector) {
        var $scope;
        this.setScope = function ($scopeArg) {
            $scope = $scopeArg;
        };
        this.onMessage = function (msg) {
            var messageDecoded = JSON.parse(msg.data);

            var commandNameToGet = 'on' + messageDecoded.command + 'Command';

            $injector.invoke([commandNameToGet, function (command) {
                    command.run($scope, messageDecoded);
                }]);
        };

        this.onClose = function () {
            console.log('close connection');
            $injector.invoke(['OnCloseConnectionByServer', function (OnCloseConnectionByServer) {
                    OnCloseConnectionByServer.run($scope);
                }]);
        }; 
    }]);
