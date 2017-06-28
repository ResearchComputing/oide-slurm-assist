angular.module('sandstone.slurm')

.controller('ConfirmOverwriteCtrl', ['$scope','$uibModalInstance','filepath',function($scope,$uibModalInstance,filepath) {
  var self = this;
  self.filepath = filepath;

  self.action = {
    filepath: self.filepath,
    overwrite: false
  };

  self.overwrite = function() {
    self.action.overwrite = true;
    $uibModalInstance.close(self.action);
  };

  self.saveAs = function() {
    $uibModalInstance.close(self.action);
  };

  self.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

}]);
