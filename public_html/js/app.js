'use strict';
/* App Module */

function onPrivateGameCreatedCommand($scope, message) {
    console.log('Mam hash gry!!');
    $scope.newPrivateGameIsCreated = true;
    $scope.newPrivateGameJoinUrl = document.URL + 'join/' + message.data.gameHashId;
    $scope.isGreetingMessageActive = false;
    $scope.isWaitingForSecondPlayer = true;
    $scope.$apply();
}

function onSecondPlayerJoinToPrivateGame($scope, message) {
    console.log('second player joined! Lets play!');
}
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

FiveInRowGameApp.controller('MainCtrl', ['$scope', function ($scope) {
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
        socket.onmessage = function (msg) {
            var messageDecoded = JSON.parse(msg.data);
            var functionToRunName = 'on' + messageDecoded.command + 'Command';
            if (typeof window[functionToRunName] === 'function') {
                window[functionToRunName]($scope, messageDecoded);
            } else {
                throw new Exception('not found corresponding function to command ' + messageDecoded.command);
            }
        };
    }]);

FiveInRowGameApp.controller('joinToPrivateGameCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
        var gameHashValue = $routeParams.gameHash;
        var socket = new WebSocket("ws://127.0.0.1:8080");
        console.log('joining to private game: '+gameHashValue);
        console.log(socket);
        socket.send(JSON.stringify({
            command:'JoinToPrivateGame',
            parameters: {gameHash:gameHashValue}
        }));
    }]);