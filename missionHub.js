angular.module('missionApp', []).controller('missionHub', function($scope, $http) {
	var hub = this;
	
	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};
	
	var getEndpointUrl = function(path) {
		return 'https://task-api-server.herokuapp.com'+path;
	}
	
	// Generate a random string
	/*
	var rnd = function(n) {
		return Math.random().toString(36).substring(2, 2+n)
	}
	*/
	
	// Allow use from angular
	hub._isFunction	= _.isFunction;
	
	// Contains the temporary data for the authentication calls
	hub.authBuffer = [];
	
	
	// Contains the temporary data for the task calls
	hub.taskBuffer = [];
		
	

	hub.login = function(email,password){
		$.ajax({
			url:		getEndpointUrl('/api/auth/login'),
			dataType:	"jsonp",
			data:		{
				email:		email,
				password:	password
			},
			success: function(response) {
				$scope.safeApply(function() {
					hub.authBuffer = _.extend(hub.authBuffer, response);
				});
				$scope.name = hub.authBuffer.data.name;
				hub.list(response.uid, response.token);
			}
		});
	}

	hub.register = function(email,password){
		$.ajax({
			url:		getEndpointUrl('/api/auth/register'),
			dataType:	"jsonp",
			data:		{
				email:		email,
				password:	password
			},
			success: function(response) {
				$scope.safeApply(function() {
					hub.authBuffer = _.extend(hub.authBuffer, response);
				});

			}
		});
	}

	hub.save = function(name, char_class){
		$.ajax({
			url:		getEndpointUrl('/api/auth/save'),
			dataType:	"jsonp",
			data:		{
				uid:		hub.authBuffer.uid,
				token:		hub.authBuffer.token,
				data: {
					name:	name,
					char_class: char_class
				}
			},
			success: function(response) {
				hub.authBuffer.data.name = name;
				hub.authBuffer.data.char_class = char_class;
				$scope.$apply();
				
			}
		});
	}

	hub.getTime = function(task){
		var date = Date.now();
		var date_created = Date.parse(task.created);
		var s = 1000;
    	var m = s * 60;
    	var h = m * 60;
    	var d = h * 24;
	    var diff = date - date_created;
	    	if (diff > d)
	            return Math.floor(diff / d) + ' day(s) ago';
	        if (diff > h)
	            return Math.floor(diff / h) + ' hour(s) ago';
	        if (diff > m)
	            return Math.floor(diff / m) + ' minute(s) ago';
	        if (diff > s)
	            return Math.floor(diff / s) + ' second(s) ago';
	        return 'just now';
	}

	hub.list = function(uid, token){
		$.ajax({
			url:		getEndpointUrl('/api/task/list'),
			dataType:	"jsonp",
			data:		{
				uid:		uid,
				token:		token
			},
			success: function(response) {
				$scope.safeApply(function() {
					hub.taskBuffer = _.extend(hub.taskBuffer, response);
				});
			}
		});
	}

	$scope.showAddMissionModal = false;

    hub.toggleAddMission = function(){
        $scope.showAddMissionModal = !$scope.showAddMissionModal;
    };

    hub.create = function(title, description){
    	$.ajax({
			url:		getEndpointUrl('/api/task/create'),
			dataType:	"jsonp",
			data:		{
				uid:		hub.authBuffer.uid,
				token:		hub.authBuffer.token,
				data: {
					mission_title: title,
					mission_description: description,
					status: 'New'
				}
			},
			success: function(response) {
				$scope.safeApply(function() {
					hub.taskBuffer = _.extend({},hub.taskBuffer, {response});
				});
			}
		});
    }

    hub.remove = function(task, index){
    	$.ajax({
			url:		getEndpointUrl('/api/task/remove'),
			dataType:	"jsonp",
			data:		{
				uid:		hub.authBuffer.uid,
				token:		hub.authBuffer.token,
				id:			task.id
			},
			success: function(response) {
				$scope.safeApply(function() {
					delete hub.taskBuffer.id;
					hub.taskBuffer.splice(index,1);
					//hub.taskBuffer = _.extend({},tasks);
				});
				$scope.$apply();
			}
		});
    }

    hub.update = function(task, index){
    	$.ajax({
			url:		getEndpointUrl('/api/task/update'),
			dataType:	"jsonp",
			data:		{
				uid:		hub.authBuffer.uid,
				token:		hub.authBuffer.token,
				id:			task.id,
				data: {
					status: 'Completed'
				}
			},
			success: function(response) {
				$scope.safeApply(function() {
				});
				$scope.$apply();
				hub.list(hub.authBuffer.uid, hub.authBuffer.token);
			}
		});
    }
})