'use strict';
/* App Module */

var FiveInRowGameApp = angular.module('FiveInRowGameApp', ['ngAnimate', 'ngRoute']);

FiveInRowGameApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/join/:gameHash', {
            controller: 'joinToPrivateGameCtrl',
            templateUrl: 'view/join-to-private-game.html'
        }).when('/', {
            controller: 'MainCtrl',
            templateUrl: 'view/main.html'
        });
    }]);

FiveInRowGameApp.factory('onStartGameCommand', ['$location', function ($location) {

        var obj = {};
        obj.run = function ($scope, message) {
            console.log('second player joined! Lets play!');
            $scope.$apply(function() { $location.path("/game"); });
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

FiveInRowGameApp.service('commandManager', ['$injector', function($injector) {
        var $scope;
        this.setScope = function($scopeArg) {
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
        var socket = new WebSocket("ws://127.0.0.1:8080");
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

FiveInRowGameApp.controller('joinToPrivateGameCtrl', ['$scope', '$routeParams', 'commandManager', function ($scope, $routeParams,commandManager) {
        var gameHashValue = $routeParams.gameHash;
        var socket = new WebSocket("ws://127.0.0.1:8080");

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
