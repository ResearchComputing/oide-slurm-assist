angular.module('sandstone.slurm')

.controller('LoadScriptCtrl', ['$scope','$uibModalInstance','FilesystemService',function($scope,$uibModalInstance,FilesystemService) {
  var self = this;

  self.treeData = {
    contents: [],
    selected: [],
    expanded: []
  };

  var valid = false;

  self.filetreeOnSelect = function(node,selected) {
    if (selected) {
      if (node.type === 'file') {
        self.loadFile.filepath = node.filepath;
        valid = true;
      }
    }
  };

  self.loadFile = {
    filepath: ''
  };

  self.validFilepath = function() {
    return valid;
  };

  self.loadScript = function () {
    var filepath;
    var filepath = FilesystemService.normalize(self.loadFile.filepath);
    $uibModalInstance.close(filepath);
  };
  self.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
