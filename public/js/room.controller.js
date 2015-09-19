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
            var message = {
                sentiment: sentiment.results,
                name: vm.user,
                text: vm.comment
            };
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
        vm.video = new Firebase('https://htn-chat.firebaseio.com/room/' + roomId + '/title');
        vm.video.once("value", function(data){
            vm.title = data.val();
        });

        //Connecting to Chat        
        vm.ref = new Firebase('https://htn-chat.firebaseio.com/room/' + roomId + '/chat/');
        vm.ref.onAuth(vm.checkAuthenticatedUser);

        vm.messages = $firebaseArray(vm.ref.limitToLast(25));

        var authData = vm.ref.getAuth();
        if (authData) {
            vm.user = authData.google.cachedUserProfile.given_name;
        }

        //Polls until Youtube API is loaded
        var youtubeAPI = setInterval(function(){
            if(apiReady){
                setYTStream(roomId);
            } else {
                clearInterval(youtubeAPI);
            }
        },1000);

        //Listens to new chat post
        vm.ref.on("child_added", function(data) {
            var message = data.val();
            if (vm.count && vm.sentiment) {
                vm.count++;
                vm.sentiment += message.sentiment;
                if (vm.count == 5) {
                    var averageSentiment = vm.sentiment / 5;
                    setSentimentValue(averageSentiment);

                    vm.count = 0;
                    vm.sentiment = 0;
                }
            } else {
                vm.count = 1;
                vm.sentiment = message.sentiment;
            }
        });

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

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
var apiReady = false;
function onYouTubeIframeAPIReady() {
    apiReady = true;
}

function setYTStream(id) {
    if (apiReady) {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: id,
            playerVars: { 'autoplay': 1 }
        });
    }
}


function getTimeElapsed() {
    if (apiReady)
        return player.getCurrentTime();
}