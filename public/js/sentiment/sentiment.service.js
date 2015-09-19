angular
	.module('app')
	.service('SentimentService', SentimentService);

SentimentService.$inject = ['$http'];

function SentimentService($http){
	/**
	 * Posts a comment to the server in order to get the 
	 * Indico sentimental analysis
	 * @param  {data : String} data input comment
	 * @return {promise}      Returns a promise which will return the
	 * sentimental score
	 */
	
	this.post = function(data){
		return $http.post('/comment', data);	
	}
}