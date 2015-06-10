'use strict';
/* App Module */
var REMOTE_ADDR = "wss://five-in-row-server.herokuapp.com";
//var REMOTE_ADDR = "ws://10.1.104.147:8080";


var FiveInRowGameApp = angular.module('FiveInRowGameApp', ['ngAnimate', 'ngRoute']);


FiveInRowGameApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/join/:gameHash', {
            controller: 'JoinToPrivateGameCtrl',
            templateUrl: 'view/join-to-private-game.html'
        }).when('/', {
            controller: 'MainCtrl',
            templateUrl: 'view/main.html'
        }).when('/game', {
            controller: 'GameCtrl',
            templateUrl: 'view/game.html'
        });
    }]);










