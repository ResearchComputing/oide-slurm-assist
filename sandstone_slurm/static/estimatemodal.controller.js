angular.module('sandstone.slurm')

.controller('EstimateCtrl', ['$scope','$uibModalInstance','sbatch',function($scope,$uibModalInstance,sbatch) {
  $scope.sbatch = sbatch;
  // nodes * time (min) * 12 (no node sharing)
  $scope.estimate = {
    su: NaN,
    reason: 'No node count specified.'
  };

  $scope.dismiss = function () {
    $uibModalInstance.dismiss('cancel');
  };

  if (sbatch.hasOwnProperty('nodes')) {
    if (sbatch.hasOwnProperty('time')) {
      var cmps = sbatch.time.split(/\:|\-/).reverse();
      var mins = 0;
      mins += parseInt(cmps[1],10);
      mins += 3600 * parseInt(cmps[2],10);
      if (cmps.length === 4) {
        mins += (24 * 3600) * parseInt(cmps[3],10);
      }
      $scope.estimate.su = sbatch.nodes * mins * 12;
      $scope.estimate.reason = undefined;
    } else {
      $scope.estimate.reason = 'No wall time specified.';
    }
  }
}]);
