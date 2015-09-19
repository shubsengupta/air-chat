angular
    .module('app')
    .controller('roomCtrl', roomCtrl);

roomCtrl.$inject = ['SentimentService', '$firebaseArray', '$firebaseAuth', 'roomId'];

function roomCtrl(SentimentService, $firebaseArray, $firebaseAuth, roomId) {
    var vm = this;
    vm.postComment = function() {
        var params = {
            data: vm.comment
        };

        //Get sentiment data then post to Firebase
        SentimentService.post(params).then(function(data) {
            var sentiment = data.data;
            console.log(message);
            var message = {
                sentiment: sentiment.results,
                name: vm.user,
                text: vm.comment
            };
            console.log(message);
            vm.messages.$add(message).then(function(ref) {
                //TODO Handle finished message
                vm.comment = '';

            });

        })
    }

    vm.loginFacebook = function() {
        var auth = $firebaseAuth(vm.ref);
        auth.$authWithOAuthPopup("google").then(function(authData) {
            vm.user = authData.google.cachedUserProfile.given_name;
        }).catch(function(error) {
            console.log("Authentication failed:", error);
        });
    }

    vm.logout = function() {
        vm.ref.unauth();
    }

    vm.init = function() {
        
        //Getting video
        vm.video = new Firebase('https://htn-chat.firebaseio.com/room/' + roomId + '/video/');
        vm.video.once("value", function(data){
            console.log(data);
        });

        //Connecting to Chat        
        vm.ref = new Firebase('https://htn-chat.firebaseio.com/room/' + roomId + '/chat/');
        vm.ref.onAuth(vm.checkAuthenticatedUser);

        vm.messages = $firebaseArray(vm.ref.limitToLast(25));

        var authData = vm.ref.getAuth();
        if (authData) {
            vm.user = authData.google.cachedUserProfile.given_name;
        }

    }
    vm.checkAuthenticatedUser = function(authData){
    if (authData){
        vm.isLoggedIn = true;
    } else {
        vm.isLoggedIn = false;
        vm.user = null;
    }
}

    /**
     * Calculates Sentiment Value and divides them into classes
     * @param  {number} value decimal representation of sentiment value
     * @return {string}       Class corresponding with the color
     */
    vm.calculateSentimentClass = function(value) {
        var classId = "";
        if (value) {
            if (value < .25) {
                classId = "label-danger";
            } else if (value < .50) {
                classId = "label-warning";
            } else if (value < .75) {
                classId = "label-default";
            } else {
                classId = "label-success";
            }
            return classId;
        }
        return "label-default";
    }

}
