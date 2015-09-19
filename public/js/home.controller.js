angular
    .module('app')
    .controller('homeCtrl', homeCtrl);

homeCtrl.$inject = ['SentimentService', '$firebaseArray', '$firebaseAuth'];

function homeCtrl(SentimentService, $firebaseArray, $firebaseAuth) {
    var vm = this;
    vm.test = "test";
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
                name: "@" + vm.user,
                text: vm.comment
            };
            console.log(message);
            vm.messages.$add(message).then(function(ref) {
                //TODO Handle finished message
                console.log('Message added successfully');
                vm.comment = '';




            });

        })
    }

    vm.loginFacebook = function() {
        var auth = $firebaseAuth(vm.ref);
        auth.$authWithOAuthPopup("twitter").then(function(authData) {
            vm.user = authData.twitter.username;
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
            vm.user = authData.twitter.username;
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

  navigator.geolocation.getCurrentPosition(successCallback,errorCallback,options);