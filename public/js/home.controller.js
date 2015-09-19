angular
	.module('app')
	.controller('homeCtrl', homeCtrl);

homeCtrl.$inject = ['SentimentService', '$firebaseArray'];
function homeCtrl(SentimentService, $firebaseArray){
	var vm = this;
	vm.test = "test";
	vm.postComment = function (){
		var params = { data : vm.comment};
    
    //Get sentiment data then post to Firebase
		SentimentService.post(params).then(function (data){
			var sentiment = data.data;
      var message = {
        sentiment : sentiment.results,
        name : vm.username,
        text : vm.comment
      };
      console.log(message);
      vm.messages.$add(message).then(function(ref){
        //TODO Handle finished message
        console.log('Message added successfully');
        vm.comment ='';
      });

		})
	}
    vm.init = function(){
      var ref = new Firebase('https://htn-chat.firebaseio.com/');
      vm.messages = $firebaseArray(ref.limitToLast(25));
    }

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
