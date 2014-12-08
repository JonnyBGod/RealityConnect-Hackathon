angular.module('filters', [])
	.filter('caasTime', function() { 
		return function(id){
			moment.locale('en-short');
	    	return moment(new Date(parseInt(id.toString().slice(0,8), 16)*1000)).calendar();
	    };
	});