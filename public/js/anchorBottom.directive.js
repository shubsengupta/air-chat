angular
	.module('app')
	.directive('anchorBottom', function() {
  return function(scope, element, attrs) {
    if (scope.$last){
      element.parent()[0].scrollTop =  element.parent()[0].scrollHeight;
    }
  };
});