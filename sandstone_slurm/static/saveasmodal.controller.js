angular.module('sandstone.slurm')

.controller('SaveAsCtrl', ['$scope','$uibModalInstance','file','action', 'FilesystemService',function($scope,$uibModalInstance,file,action,FilesystemService) {
  var self = this;

  if (action === 'save') {
    self.title = "Save Script As";
  } else if (action === 'submit') {
    self.title = "Save & Schedule Script";
  }

  self.treeData = {
    contents: [],
    selected: [],
    expanded: []
  };

  self.filetreeOnSelect = function(node,selected) {
    if (selected) {
      if ( (node.type === 'directory') || (node.type === 'volume') ) {
        self.newFile.dirpath = node.filepath;
      } else {
        self.newFile.dirpath = node.dirpath;
        self.newFile.name = node.name;
      }
    }
  };

  self.newFile = {
    name: file.name,
    dirpath: file.dirpath
  };

  self.validFilepath = function() {
    var valid = (self.newFile.name.length && self.newFile.dirpath.length);
    valid = valid && (FilesystemService.isAbsolute(self.newFile.dirpath));
    return valid;
  };

  self.saveAs = function () {
    var filepath;
    var dirpath = FilesystemService.normalize(self.newFile.dirpath);
    filepath = FilesystemService.join(dirpath,self.newFile.name);

    if (filepath.substr(filepath.length-3) !== '.sh') {
      filepath += '.sh';
    }

    $uibModalInstance.close(filepath);
  };

  self.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
