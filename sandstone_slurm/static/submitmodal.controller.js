angular.module('sandstone.slurm')

.controller('SubmitStatusCtrl', ['$scope','$uibModalInstance','data',function($scope,$uibModalInstance,data) {
  $scope.output = data.output;
  $scope.dismiss = function () {
    $uibModalInstance.dismiss('dismiss');
  };
}]);
