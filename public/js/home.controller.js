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