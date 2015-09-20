angular
    .module('app')
    .config(routesConfig);

routesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

function routesConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');


    var landing = {
        url:"/",
        templateUrl:"templates/landing.html",
        controller : "landingCtrl",
        controllerAs : "landing"
    };

    var room = {
        url : "/room/:id",
        templateUrl : "templates/room.html",
        controller : "roomCtrl",
        controllerAs : "room",
        resolve : {
            roomId : ['$stateParams', function ($stateParams){
                return $stateParams.id;
            }]
        }
    };

    $stateProvider.state('landing', landing)
                  .state('room', room);

}
