angular
    .module('app')
    .controller('homeCtrl', homeCtrl);

homeCtrl.$inject = ['SentimentService', '$firebaseArray', '$firebaseAuth'];

function homeCtrl(SentimentService, $firebaseArray, $firebaseAuth) {
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
                console.log('Message added successfully');
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
        
        vm.ref = new Firebase('https://htn-chat.firebaseio.com/testing');

        vm.ref.onAuth(vm.checkAuthenticatedUser);

        vm.messages = $firebaseArray(vm.ref.limitToLast(25));
        if (navigator.geolocation) {
            var timeoutVal = 10 * 1000 * 1000;
            navigator.geolocation.getCurrentPosition(
                displayPosition,
                displayError, {
                    enableHighAccuracy: true,
                    timeout: timeoutVal,
                    maximumAge: 0
                }
            );
        } else {
            alert("Geolocation is not supported by this browser");
        }

        var authData = vm.ref.getAuth();
        if (authData) {
            vm.user = authData.google.cachedUserProfile.given_name;
        }

        //Listens to new chat post
        vm.ref.on("child_added", function(data){
            var message = data.val();
            if (vm.count && vm.sentiment){
                vm.count++;
                vm.sentiment += message.sentiment;
                if (vm.count == 5){
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

//Successful Callback for Geotag
function displayPosition(position){
    console.log(position);
}
//Error Callback for Geotag
function displayError(err) {
    console.log(err);
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
        case 1: color = '#d9534f';//red
            break;
        case 2: color = '#f0ad4e';//yellow
            break;
        case 3: color = '#5cb85c';//green
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

function displayLocation(latitude,longitude){
    var request = new XMLHttpRequest();

    var method = 'GET';
    var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true';
    var async = true;

    request.open(method, url, async);
    request.onreadystatechange = function(){
      if(request.readyState == 4 && request.status == 200){
        var data = JSON.parse(request.responseText);
        var address = data.results[0];
        console.log(address.formatted_address);
      }
    };
    request.send();
  };

  var successCallback = function(position){
    var x = position.coords.latitude;
    var y = position.coords.longitude;
    displayLocation(x,y);
  };

  var errorCallback = function(error){
    var errorMessage = 'Unknown error';
    switch(error.code) {
      case 1:
        errorMessage = 'Permission denied';
        break;
      case 2:
        errorMessage = 'Position unavailable';
        break;
      case 3:
        errorMessage = 'Timeout';
        break;
    }
    document.write(errorMessage);
  };

  var options = {
    enableHighAccuracy: true,
    timeout: 6000,
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
