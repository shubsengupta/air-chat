angular
    .module('app')
    .controller('landingCtrl', LandingCtrl);

LandingCtrl.$inject = ['$firebaseObject', '$http', '$scope']

function LandingCtrl($firebaseObject, $http, $scope) {
    var vm = this;
    vm.createLink = function() {

        var youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        var responseLink = youtubeRegex.exec(vm.link)[1];
        vm.ref = new Firebase('https://htn-chat.firebaseio.com/room/' + responseLink + '/');
        vm.room = $firebaseObject(vm.ref);
        vm.room.link = vm.link;
        vm.room.title = vm.event;
        if (vm.location) {
            vm.room.location = vm.location;
        }
        vm.room.$save();
        vm.response = "http://localhost:3000/#/room/" + responseLink;
    }

    vm.init = function() {
        vm.ref = new Firebase('https://htn-chat.firebaseio.com/room/');
        vm.localStreams = [];
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    var x = position.coords.latitude;
                    var y = position.coords.longitude;
                    $http
                        .get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + x + ',' + y + '&sensor=true')
                        .then(function(data) {
                            if (data) {
                                var address = data.data.results[1].formatted_address;
                                vm.location = {
                                    description: address,
                                    x: x,
                                    y: y
                                };
                                vm.ref.once('value', function(res) {
                                    res.forEach(function(child) {
                                        var stream = child.val();
                                        if (stream.location) {
                                            if (stream.location.description === vm.location.description) {
                                                vm.localStreams.push(stream);

                                            }
                                        }
                                    });
                                    $scope.$apply();

                                });
                            }
                        })
                },
                function(error) {
                    if (error) {
                        var errorMessage = 'Unknown error';
                        switch (error.code) {
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
                        console.log("Error", errorMessage);
                    }

                }, {
                    enableHighAccuracy: true,
                    timeout: 6000,
                    maximumAge: 0
                }

            );
        }


    }

    vm.getLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    var x = position.coords.latitude;
                    var y = position.coords.longitude;
                    $http
                        .get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + x + ',' + y + '&sensor=true')
                        .then(function(data) {
                            if (data) {
                                var address = data.data.results[1].formatted_address;
                                vm.location = {
                                    description: address,
                                    x: x,
                                    y: y
                                };
                            }
                        });
                }, function(error) {
                    if (error) {
                        var errorMessage = 'Unknown error';
                        switch (error.code) {
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
                        console.log("Error", errorMessage);
                    }

                }, {
                    enableHighAccuracy: true,
                    timeout: 6000,
                    maximumAge: 0
                }

            );
        } else {
            alert("Geolocation is not supported by this browser");
        }
    }

    vm.getId = function(stream){
        var youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        var responseLink = youtubeRegex.exec(stream.link)[1];
        return {id : responseLink};
    }


}