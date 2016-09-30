'use strict';

angular.module('sandstone.slurm')

.directive('saSbatchScript', [function() {
  return {
    restrict: 'A',
    scope: {
      sbatch: '=',
      script: '=',
      sbatchScript: '='
    },
    templateUrl: '/static/slurm/sa-sbatchscript/sa-sbatchscript.html',
    controller: function($scope,$element,$timeout) {
      $scope.directives = '#!/bin/bash\n';
      $scope.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n'

      $scope.compileScript = function(dirs) {
        var dirString = '#!/bin/bash\n';
        for (var k in dirs) {
          if ((typeof dirs[k] !== 'undefined') && (dirs[k] !== '') && (dirs[k] !== false)) {
            if ((typeof dirs[k] === 'boolean') && (dirs[k])) {
              dirString += '#SBATCH --' + k + '\n';
            } else {
              dirString += '#SBATCH --' + k + '=' + dirs[k] + '\n';
            }
          }
        }
        $scope.directives = dirString;
        $scope.sbatchScript = dirString + $scope.script;
      };

      $scope.$watch('sbatch', function(newVal, oldVal) {
        $scope.compileScript(newVal);
      }, true);

      $scope.$watch('script', function(newVal, oldVal) {
        $scope.compileScript($scope.sbatch);
      }, true);
    }
  };
}]);
