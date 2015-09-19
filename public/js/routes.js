angular
    .module('app')
    .config(routesConfig);

routesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

function routesConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    var home = {
        url: "/",
        templateUrl: "templates/home.html",
        controller : 'homeCtrl',
        controllerAs : 'home'
    };

    var landing = {
        url:"/landing",
        templateUrl:"templates/landing.html",
        controller : "landingCtrl",
        controllerAs : "landing"
    };

    $stateProvider.state('home', home)
                  .state('landing', landing);

}
