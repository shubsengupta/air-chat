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