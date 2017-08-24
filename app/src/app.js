(function () {
    'use strict';

    var App = angular.module('myDemoApp', [
        'ui.router', 'module'
    ]);

    App.config(['$urlRouterProvider', '$locationProvider',
		function ($urlRouterProvider, $locationProvider) {
		  'use strict';
          $locationProvider.html5Mode(false);
		  $urlRouterProvider.otherwise("/home");
		}])

})();