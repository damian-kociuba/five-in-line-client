'use strict';
/* App Module */
var REMOTE_ADDR = "ws://10.1.104.147:8080";

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
        this.playerColor;

        console.log('gamesystem construct');
    }]);

FiveInRowGameApp.factory('onStartGameCommand', ['$location', 'gameSystem', function ($location, gameSystem) {

        var obj = {};
        obj.run = function ($scope, message) {
            console.log('second player joined! Lets play!');
            gameSystem.isPlayerTurn = message.parameters.isPlayerTurn;
            gameSystem.playerColor = message.parameters.playerColor;
            gameSystem.isGameStarted = true;
            gameSystem.board = new Board(20, 20);
            $scope.$apply(function () {
                $location.path("/game");
            });
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onPrivateGameCreatedCommand', ['$location', function ($location) {
        var obj = {};
        obj.run = function ($scope, message) {
            $scope.newPrivateGameIsCreated = true;
            $scope.newPrivateGameJoinUrl = document.URL + 'join/' + message.data.gameHashId;
            $scope.isGreetingMessageActive = false;
            $scope.isWaitingForSecondPlayer = true;
            $scope.$apply();
        };
        return obj;
    }]);
FiveInRowGameApp.factory('onMoveMadeCommand', ['gameSystem', function (gameSystem) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.log('Zrobiono ruch');
            console.log(message);
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
            if(message.parameters.result === 'PlayerWin') {
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
    }]);

FiveInRowGameApp.controller('MainCtrl', ['$scope', 'commandManager', 'gameSystem', function ($scope, commandManager, gameSystem) {
        gameSystem.isGameStarted = false;

        socket = new WebSocket(REMOTE_ADDR);
        console.log('new connection');
        $scope.isGame = false;
        $scope.isGreetingMessageActive = true;
        $scope.isWaitingForSecondPlayer = false;

        $scope.createPrivateGame = function () {

            socket.send(JSON.stringify({
                command: 'CreatePrivateGame',
                parameters: {playerName: 'damian'}
            }));
        };

        $scope.isGreetingMessageShowed = function () {
            return $scope.isGreetingMessageActive;
        };
        commandManager.setScope($scope);
        socket.onmessage = commandManager.onMessage;
    }]);

FiveInRowGameApp.controller('joinToPrivateGameCtrl', ['$scope', '$routeParams', 'commandManager', 'gameSystem', function ($scope, $routeParams, commandManager, gameSystem) {
        gameSystem.isGameStarted = false;

        socket = new WebSocket(REMOTE_ADDR);
        console.log('new connection');
        var gameHashValue = $routeParams.gameHash;

        $scope.joinToPrivateGame = function () {
            var playerName = $scope.playerName;
            socket.send(JSON.stringify({
                command: 'JoinToPrivateGame',
                parameters: {
                    gameHash: gameHashValue,
                    playerName: playerName
                }
            }));
        };

        commandManager.setScope($scope);
        socket.onmessage = commandManager.onMessage;


    }]);

FiveInRowGameApp.controller('gameCtrl', ['$scope', 'gameSystem', 'commandManager', function ($scope, gameSystem, commandManager) {
        $scope.secondPlayerLeftTheGame = false;
        $scope.playerWin = false;
        $scope.oponentWin = false;
        $scope.isNotPlayerTurnMessageShow = false;
        
        $scope.isPlayerTurn = function () {
            return gameSystem.isPlayerTurn;
        };
        $scope.isGameValid = function () {
            return gameSystem.isGameStarted;
        };
        $scope.getBoard = function () {
            return gameSystem.board;
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
        commandManager.setScope($scope);
        if ($scope.isGameValid()) {
            socket.onmessage = commandManager.onMessage;
        }
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