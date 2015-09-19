angular
	.module('app')
	.controller('homeCtrl', homeCtrl);

homeCtrl.$inject = ['SentimentService'];
function homeCtrl(SentimentService){
	var vm = this;
	vm.test = "test";
	vm.postComment = function (){
		var params = { data : vm.comment};
		SentimentService.post(params).then(function (data){
			vm.postSentiment = data.data;
		})
	}
    vm.init = initFirebase;

}

function setSentimentValue(value) {

    //set color depending on how high the value is
    var color;
    if (value < 0.33) {
        color = '#d9534f';//red
    } else if (value < 0.66) {
        color = '#f0ad4e';//yellow
    } else {
        color = '#5cb85c';//green
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

function initFirebase() {
  // CREATE A REFERENCE TO FIREBASE
  var messagesRef = new Firebase('https://htn-chat.firebaseio.com/');

  // REGISTER DOM ELEMENTS
  var messageField = $('#messageInput');
  var nameField = $('#nameInput');
  var messageList = $('#example-messages');

  // LISTEN FOR KEYPRESS EVENT
  messageField.keypress(function (e) {
    if (e.keyCode == 13) {
      //FIELD VALUES
      var username = nameField.val();
      var message = messageField.val();


      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      messagesRef.push({name:username, text:message});
      messageField.val('');
    }
  });

  // Add a callback that is triggered for each chat message.
  messagesRef.limitToLast(10).on('child_added', function (snapshot) {
    //GET DATA
    var data = snapshot.val();
    var username = data.name || "anonymous";
    var message = data.text;

    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
    var messageElement = $("<li class='comment'>");
    var nameElement = $("<strong class='label label-default'></strong>")
    nameElement.text(username);
    messageElement.text(message).prepend(nameElement);

    //ADD MESSAGE
    messageList.append(messageElement)

    //SCROLL TO BOTTOM OF MESSAGE LIST
    messageList[0].scrollTop = messageList[0].scrollHeight;
  });
}

if (navigator.geolocation) {
  var timeoutVal = 10 * 1000 * 1000;
  navigator.geolocation.getCurrentPosition(
    displayPosition, 
    displayError,
    { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
  );
}
else {
  alert("Geolocation is not supported by this browser");
}

function displayPosition(position) {
  console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude);
}

function displayError(error) {
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}