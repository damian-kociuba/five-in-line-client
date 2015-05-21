'use strict';
/* App Module */
var REMOTE_ADDR = "wss://five-in-row-server.herokuapp.com";
//var REMOTE_ADDR = "ws://10.1.104.147:8080";


var FiveInRowGameApp = angular.module('FiveInRowGameApp', ['ngAnimate', 'ngRoute']);
var socket;


FiveInRowGameApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/join/:gameHash', {
            controller: 'joinToPrivateGameCtrl',
            templateUrl: 'view/join-to-private-game.html'
        }).when('/', {
            controller: 'MainCtrl',
            templateUrl: 'view/main.html'
        }).when('/game', {
            controller: 'gameCtrl',
            templateUrl: 'view/game.html'
        });
    }]);
FiveInRowGameApp.service('gameSystem', [function () {
        this.isPlayerTurn = false;
        this.isGameStarted = false;
        this.isGameFinished = false;
        this.isWaitingForSecondPlayer = false;
        this.playerColor;
        this.playerName;
        this.opponentName;

        console.log('GameSystem construct');
    }]);

FiveInRowGameApp.factory('onStartGameCommand', ['$location', 'gameSystem', function ($location, gameSystem) {

        var obj = {};
        obj.run = function ($scope, message) {
            console.log('second player joined! Lets play!');
            gameSystem.isPlayerTurn = message.parameters.isPlayerTurn;
            gameSystem.playerColor = message.parameters.playerColor;
            gameSystem.opponentName = message.parameters.opponentName;
            
            $scope.$parent.pageTitle = 'Five in row game - ' + gameSystem.playerName + ' vs. ' + gameSystem.opponentName;
            
            gameSystem.isGameStarted = true;
            gameSystem.board = new Board(20, 20);
            $scope.$apply(function () {
                $location.path("/game");
            });
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onPrivateGameCreatedCommand', ['gameSystem', function (gameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            $scope.newPrivateGameIsCreated = true;
            $scope.newPrivateGameJoinUrl = document.URL + 'join/' + message.data.gameHashId;
            $scope.isGreetingMessageActive = false;
            gameSystem.isWaitingForSecondPlayer = true;
            $scope.$apply();
        };
        return obj;
    }]);
FiveInRowGameApp.factory('onMoveMadeCommand', ['gameSystem', function (gameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.log('Zrobiono ruch');
            var board = gameSystem.board;
            board.setByXY(message.parameters.x, message.parameters.y, {type: message.parameters.color});
            gameSystem.isPlayerTurn = message.parameters.isPlayerTurn;
            $scope.$apply();
        };
        return obj;
    }]);
FiveInRowGameApp.factory('onFinishGameCommand', ['gameSystem', function (gameSystem) {
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
            gameSystem.isPlayerTurn = false;
            gameSystem.isGameFinished = true;
            $scope.$apply();
        };
        return obj;
    }]);
FiveInRowGameApp.factory('onErrorCommand', ['gameSystem', function (gameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.error(message.parameters.message);
        };
        return obj;
    }]);
FiveInRowGameApp.factory('onCloseGameCommand', ['gameSystem', '$location', function (gameSystem, $location) {
        var obj = {};
        obj.run = function ($scope, message) {
            if (gameSystem.isGameStarted) {
                gameSystem.isGameFinished = true;
                $scope.secondPlayerLeftTheGame = true;
                $scope.$apply();
            }
        };
        return obj;
    }]);


FiveInRowGameApp.factory('onCloseConnectionByServer', ['gameSystem', function (gameSystem) {
        var obj = {};
        obj.run = function ($scope) {
            if (gameSystem.isGameStarted) {
                gameSystem.isGameFinished = true;
                $scope.connectionClosedByServer = true;

            } else if (gameSystem.isWaitingForSecondPlayer) {

                $scope.message = {
                    type: 'error',
                    content: 'The waiting time has elapsed'
                };
            }
            $scope.$apply();
        };
        return obj;
    }]);

FiveInRowGameApp.service('commandManager', ['$injector', function ($injector) {
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
            $injector.invoke(['onCloseConnectionByServer', function (onCloseConnectionByServer) {
                    onCloseConnectionByServer.run($scope);
                }]);
        };
    }]);

FiveInRowGameApp.service('socket', ['commandManager', function (commandManager) {
        this.connected = false;
        var keepConnection = false;
        var onOpenEvent;
        var connectionRefresher = new ConnectionRefresher(this);

        this.setKeepConnection = function (keepConnectionArg) {
            keepConnection = keepConnectionArg;
        };

        this.connect = function () {
            if (this.connected) {
                return;
            }
            this.socket = new WebSocket(REMOTE_ADDR);
            console.log('new connection');

            this.socket.onmessage = function (msg) {

                commandManager.onMessage(msg);
                if (keepConnection) {
                    connectionRefresher.restart();
                }
            };
            this.socket.onclose = function () {
                commandManager.onClose();
                if (keepConnection) {
                    connectionRefresher.stop();
                }
            };

            this.socket.onopen = function () {
                if (typeof (onOpenEvent) === 'function') {
                    onOpenEvent();
                }
                if (keepConnection) {
                    connectionRefresher.start();
                }
            };

            this.connected = true;
        };

        this.disconnect = function () {
            if (!this.connected) {
                return;
            }
            this.socket.close();
            this.connected = false;

        };

        this.setWorkScope = function (scope) {
            commandManager.setScope(scope);
        };

        this.setOnOpenEvent = function (fun) {
            onOpenEvent = fun;
        };
        this.send = function (msg) {
            this.socket.send(msg);
        };
    }]);


function ConnectionRefresher(socket) {
    this.interval = null;
    this.start = function () {
        this.interval = setInterval(function () {
            socket.send(JSON.stringify({
                command: 'RefreshConnection',
                parameters: {}
            }));
            console.log('refresh connection!');
        }, 50000);

    };

    this.stop = function () {

        if (this.interval === null) {
            return;
        }
        clearInterval(this.interval);
        this.interval = null;
    };

    this.restart = function () {

        this.stop();
        this.start();
    };

}
FiveInRowGameApp.controller('PageCtrl', ['$scope', function ($scope) {
        $scope.pageTitle = 'Five in row game';
}]);
FiveInRowGameApp.controller('MainCtrl', ['$scope', 'gameSystem', 'socket', function ($scope, gameSystem, socket) {
        $scope.playerName;
        $scope.resetCtrl = function () {
            gameSystem.isGameStarted = false;
            gameSystem.isWaitingForSecondPlayer = false;
            $scope.isConfigurePrivateGameMode = false;
            $scope.message = null;
            $scope.isGreetingMessageActive = true;
            socket.setKeepConnection(false);
        };

        $scope.resetCtrl();

        $scope.isWaitingForSecondPlayer = function () {
            return gameSystem.isWaitingForSecondPlayer;
        };

        socket.disconnect(); //it is posible, that old game connection are still open
        socket.setWorkScope($scope);
        $scope.configurePrivateGame = function () {
            $scope.isGreetingMessageActive = false;
            $scope.isConfigurePrivateGameMode = true;
        };
        $scope.createPrivateGame = function () {
            $scope.isConfigurePrivateGameMode = false;
            socket.connect();
            gameSystem.playerName = $scope.playerName;
            
            socket.setOnOpenEvent(function () {
                socket.send(JSON.stringify({
                    command: 'CreatePrivateGame',
                    parameters: {playerName: $scope.playerName}
                }));
            });
        };

        $scope.isGreetingMessageShowed = function () {
            return $scope.isGreetingMessageActive;
        };



    }]);

FiveInRowGameApp.controller('joinToPrivateGameCtrl', ['$scope', '$routeParams', 'gameSystem', 'socket', function ($scope, $routeParams, gameSystem, socket) {
        gameSystem.isGameStarted = false;
        socket.setKeepConnection(false);

        var gameHashValue = $routeParams.gameHash;

        $scope.joinToPrivateGame = function () {
            socket.setWorkScope($scope);
            socket.connect();
            var playerName = $scope.playerName;
            gameSystem.playerName = playerName;
            socket.setOnOpenEvent(function () {
                socket.send(JSON.stringify({
                    command: 'JoinToPrivateGame',
                    parameters: {
                        gameHash: gameHashValue,
                        playerName: playerName
                    }
                }));
            });

        };

    }]);

FiveInRowGameApp.controller('gameCtrl', ['$scope', 'gameSystem', 'socket', function ($scope, gameSystem, socket) {
        $scope.secondPlayerLeftTheGame = false;
        $scope.playerWin = false;
        $scope.oponentWin = false;
        $scope.isNotPlayerTurnMessageShow = false;
        socket.setKeepConnection(true);

        $scope.isPlayerTurn = function () {
            return gameSystem.isPlayerTurn;
        };
        $scope.isGameValid = function () {
            return gameSystem.isGameStarted;
        };
        $scope.getBoard = function () {
            return gameSystem.board;
        };
        $scope.getPlayerColor = function () {
            return gameSystem.playerColor;
        };
        $scope.makeMove = function (x, y) {
            if (!gameSystem.isPlayerTurn) {
                $scope.isNotPlayerTurnMessageShow = true;
                return;
            }
            if (gameSystem.board.getByXY(x, y).type !== 'empty') {
                return;
            }
            console.log('Move to' + x + ', ' + y);
            socket.send(JSON.stringify({
                command: 'MakeMove',
                parameters: {
                    x: x,
                    y: y
                }
            }));

        };
        socket.setWorkScope($scope);
        socket.connect();
//        commandManager.setScope($scope);
//        if ($scope.isGameValid()) {
//            socket.onmessage = commandManager.onMessage;
//        }
    }]);

function Board(width, height) {
    this.width = width;
    this.height = height;
    this.fields = [];
    for (var i = 0; i < height; i++) {
        this.fields[i] = [];
        for (var j = 0; j < width; j++) {
            this.fields[i][j] = {type: 'empty'};
        }
    }

    this.getByXY = function (x, y) {
        return this.fields[y][x];
    };
    this.setByXY = function (x, y, value) {
        this.fields[y][x] = value;
    };
}