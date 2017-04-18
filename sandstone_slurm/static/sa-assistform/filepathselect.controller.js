'use strict';

angular.module('sandstone.slurm')

.controller('FilepathSelectCtrl', ['$log','$scope','$modal',function($log,$scope,$modal) {
  var self = this;

  self.selectFilepath = function() {
    var selectFilepathModalInstance = $modal.open({
      templateUrl: '/static/slurm/sa-assistform/filepathselect.modal.html',
      controller: 'FiletreeSelectCtrl',
      controllerAs: 'ctrl',
      backdrop: 'static',
      keyboard: true,
      size: 'lg',
      resolve: {
        filepath: function () {
          return $scope.sbatch[$scope.field.title];
        },
        dironly: function() {
          return $scope.field.dironly;
        }
      }
    });
    selectFilepathModalInstance.result.then(
      function(filepath) {
        $scope.sbatch[$scope.field.title] = filepath;
      },
      function(filepath) {
        $log.debug('Modal dismissed at: ' + new Date());
      }
    );
  };
}])
.controller('FiletreeSelectCtrl', ['$scope','$modalInstance','FilesystemService','filepath','dironly',function($scope,$modalInstance,FilesystemService,filepath,dironly) {
  $scope.dironly = dironly;
  $scope.title = "Select or create filepath";
  if (dironly) {
    $scope.title = "Select directory";
  }

  $scope.treeData = {
    contents: [],
    selected: [],
    expanded: []
  };

  $scope.filetreeOnSelect = function(node,selected) {
    if (selected) {
      if ( (node.type === 'directory') || (node.type === 'volume') ) {
        $scope.newFile.dirpath = node.filepath;
      } else {
        $scope.newFile.dirpath = node.dirpath;
        $scope.newFile.name = node.name;
      }
    }
  };

  $scope.newFile = {
    name: '',
    dirpath: '-/'
  };

  $scope.validFilepath = function() {
    var valid = false;
    if(dironly) {
      valid = ($scope.newFile.dirpath.length > 0);
      valid = valid && (FilesystemService.isAbsolute($scope.newFile.dirpath));
    } else {
      valid = ($scope.newFile.name.length && $scope.newFile.dirpath.length);
      valid = valid && (FilesystemService.isAbsolute($scope.newFile.dirpath));
    }
    return valid;
  };

  $scope.selectPath = function () {
    var filepath;
    var dirpath;
    dirpath = FilesystemService.normalize($scope.newFile.dirpath);
    if(dironly) {
      filepath = dirpath;
    } else {
      filepath = FilesystemService.join(dirpath,$scope.newFile.name);
    }
    $modalInstance.close(filepath);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
