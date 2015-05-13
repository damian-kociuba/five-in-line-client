'use strict';
/* App Module */
var REMOTE_ADDR = "ws://10.1.104.147:8080";

var FiveInRowGameApp = angular.module('FiveInRowGameApp', ['ngAnimate', 'ngRoute']);
var socket = new WebSocket(REMOTE_ADDR);

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
        this.playerColor;
        this.board = new Board(20,20);

        console.log('gamesystem construct');
    }]);

FiveInRowGameApp.factory('onStartGameCommand', ['$location', 'gameSystem', function ($location, gameSystem) {

        var obj = {};
        obj.run = function ($scope, message) {
            console.log('second player joined! Lets play!');
            gameSystem.isPlayerTurn = message.parameters.isPlayerTurn;
            gameSystem.playerColor = message.parameters.playerColor;
            gameSystem.isGameStarted = true;
            $scope.$apply(function () {
                $location.path("/game");
            });
        };
        return obj;
    }]);

FiveInRowGameApp.factory('onPrivateGameCreatedCommand', ['$location', function ($location) {
        var obj = {};
        obj.run = function ($scope, message) {
            console.log('Mam hash gry!!');
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
            alert(message.parameters.result);
            gameSystem.isPlayerTurn = false;
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
    }]);

FiveInRowGameApp.controller('MainCtrl', ['$scope', 'commandManager', function ($scope, commandManager) {
        console.log(socket);
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

FiveInRowGameApp.controller('joinToPrivateGameCtrl', ['$scope', '$routeParams', 'commandManager', function ($scope, $routeParams, commandManager) {
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
        $scope.isPlayerTurn = function () {
            return gameSystem.isPlayerTurn;
        };
        $scope.isGameValid = function () {
            return gameSystem.isGameStarted;
        };
        $scope.getBoard = function() {
            return gameSystem.board;
        };
        $scope.makeMove = function (x, y) {
            if(!gameSystem.isPlayerTurn) {
                alert("It's not your turn");
                return;
            }
            if(gameSystem.board.getByXY(x, y).type!=='empty') {
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
        console.log(gameSystem);
        commandManager.setScope($scope);
        socket.onmessage = commandManager.onMessage;
    }]);

function Board(width, height) {
    this.width = width;
    this.height = height;
    this.fields = [];
    for (var i = 0; i < height; i++) {
        this.fields[i] = [];
        for (var j = 0; j < width; j++) {
            this.fields[i][j] = {type:'empty'};
        }
    }

    this.getByXY = function (x, y) {
        return this.fields[y][x];
    };
    this.setByXY = function (x, y, value) {
        this.fields[y][x] = value;
    };
}