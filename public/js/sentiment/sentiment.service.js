angular
	.module('app')
	.service('SentimentService', SentimentService);

SentimentService.$inject = ['$http'];
function SentimentService($http){

}