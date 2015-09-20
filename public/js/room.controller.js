angular
    .module('app')
    .controller('roomCtrl', roomCtrl);

roomCtrl.$inject = ['SentimentService', '$firebaseArray', '$firebaseAuth', 'roomId'];
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

var lastInt;
var numComments = 0;
var lastTime = 0;

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
    if (player)
        return player.getCurrentTime();
}
function roomCtrl(SentimentService, $firebaseArray, $firebaseAuth, roomId) {
    var vm = this;
    vm.postComment = function() {
        if (vm.user) {
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
        } else {
            alert("You are not logged in, please login then try again.")
        }
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
        vm.video.once("value", function(data) {
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
        var youtubeAPI = setInterval(function() {
            if (apiReady) {
                setYTStream(roomId);
                clearInterval(youtubeAPI);
            }
        }, 1000);

        //Listens to new chat post
        vm.ref.on("child_added", function(data) {
            var message = data.val();
            if (vm.count && vm.sentiment) {
                numComments++;
                if (numComments == 1) {
                    var timeElapsed = getTimeElapsed();
                    var duration = (timeElapsed - lastTime) * 1000;
                    var startTime = secondsToHms(lastTime);
                    addBlock(startTime, duration, 0);
                    lastTime = timeElapsed;
                }
                vm.count++;
                vm.sentiment += message.sentiment;
                if (vm.count == 5) {
                    var averageSentiment = vm.sentiment / 5;
                    setSentimentValue(averageSentiment);

                    var sentimentNum = 3;
                    if (averageSentiment < 0.33) {
                        sentimentNum = 1;
                    } else if (averageSentiment < 0.66) {
                        sentimentNum = 2;
                    }

                    var timeElapsed = getTimeElapsed();
                    if (lastInt != null) {
                        if (lastInt != sentimentNum) {//change in sentiment. add a block.
                            var duration = (timeElapsed - lastTime)*1000;
                            var startTime = secondsToHms(lastTime);
                            addBlock(startTime, duration, lastInt);
                            lastTime = timeElapsed;
                            lastInt = sentimentNum;
                        }
                    } else {
                        lastInt = sentimentNum;
                    }
                    vm.count = 0;
                    vm.sentiment = 0;
                }
            } else {
                vm.count = 1;
                vm.sentiment = message.sentiment;
            }
        });

    }
    vm.checkAuthenticatedUser = function(authData) {
        if (authData) {
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

/**
 * Adds a sentiment block to the sentiment container.
 * Format for startTime: 'hh:mm:ss'
 * Duration is inputed in terms of milliseconds.
 * type: 1 for red, 2 for yellow, 3 for green
 * @param {String} startTime
 * @param {Number} duration
 * @return {Number} type
 */
function addBlock(startTime, duration, type) {
    var color;
    switch (type) {
        case 0:
            color = '#000000';
            break;
        case 1:
            color = '#d9534f'; //red
            break;
        case 2:
            color = '#f0ad4e'; //yellow
            break;
        case 3:
            color = '#5cb85c'; //green
            break;
    }

    var sentimentContainer = document.getElementById('sentiment-container');

    var block = document.createElement('div');
    block.className = 'sentiment-block';
    block.style.flexGrow = duration;
    block.style.background = color;
    //block.setAttribute('data-toggle', 'tooltip');
    block.setAttribute('title', 'Start time: ' + startTime);
    //block.setAttribute('onclick','playVidFrom('+'"' + startTime + '");')

    sentimentContainer.appendChild(block);
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hString = h + "";
    var mString = m + "";
    var sString = s + "";

    if(h<10)
        hString = "0" + hString;
    if(m<10)
        mString = "0" + mString;
    if (s < 10)
        sString = "0" + sString;
    return hString + ":" + mString + ":" + sString;

}

function setSentimentValue(value) {

    //set color depending on how high the value is
    var color;
    if (value < 0.33) {
        color = '#d9534f'; //red
    } else if (value < 0.66) {
        color = '#f0ad4e'; //yellow
    } else {
        color = '#5cb85c'; //green
    }

    //set the border color of the sentiment bar
    var bar = document.getElementById("vertical-sentiment-bar");
    bar.style.borderColor = color;

    //delete any sentiment bar styles in the header
    var headStyle = document.getElementById('barAfterStyle');
    if (headStyle != null)
        document.head.removeChild(headStyle);

    //add new sentiment bar style in the header
    var barAfterStyle = document.createElement("style");
    barAfterStyle.setAttribute('id', 'barAfterStyle');
    barAfterStyle.innerHTML = "#vertical-sentiment-bar:after{content: '';display: block;position: absolute;left: 4px;bottom: 4px;width: 75%;border-radius: 3px; height: " + value * 100 + "%; background: " + color + ";";

    document.head.appendChild(barAfterStyle);
}