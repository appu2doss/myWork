(function () {
    'use strict';
    angular.module("home", [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('home', {
                            url: "/home"
                            , title: "Home"
                            , templateUrl: "app/src/module/home/home.html"
                            , controller: "homeCtrl"
                            , params:{
                                userParams:""
                            }
                    })
        }]);
})();