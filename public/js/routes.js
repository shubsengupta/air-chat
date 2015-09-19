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

    $stateProvider.state('home', home);

}
