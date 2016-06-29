'use strict';

angular.module('sandstone.slurm')

.directive('saAssistForm', [function() {
  return {
    restrict: 'A',
    scope: {
      config: '=',
      form: '='
    },
    templateUrl: '/static/slurm/templates/sa-assistform.html',
    controller: function($scope,$element,$timeout) {
      $scope.selectedProfile = '';

      $scope.getProperties = function() {
        var props = [];
        try {
          for (var p in $scope.config.profiles[$scope.selectedProfile].schema.properties) props.push(p);
        } catch(err) {}
        return props;
      };

      $scope.getProfiles = function() {
        var keys = [];
        for (var k in $scope.config.profiles) keys.push(k);
        return keys;
      };

      $scope.selectProfile = function() {
        // Update schema, transfer values
      };
    }
  };
}]);