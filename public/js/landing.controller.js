angular
    .module('app')
    .controller('landingCtrl', LandingCtrl);

LandingCtrl.$inject = ['$firebaseObject']

function LandingCtrl($firebaseObject) {
    var vm = this;
    vm.createLink = function() {
    	var responseLink = randomString(12);
        vm.ref = new Firebase('https://htn-chat.firebaseio.com/room/' + responseLink + '/');
        vm.room = $firebaseObject(vm.ref);
        vm.room.link = vm.link;
        vm.room.title = vm.event;
        if (vm.location) {
            vm.room.location = vm.location;
        }
        vm.room.$save();
        vm.response = "http://localhost:3000/#/room/" + responseLink;
    }

    vm.getLocation = function() {
        console.log("hel");
    }
}

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}