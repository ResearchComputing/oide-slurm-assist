'use strict';

angular.module('sandstone.slurm')

.controller('ScheduleCtrl', ['$log','$modal','$rootScope','ScheduleService',function($log,$modal,$rootScope,ScheduleService) {
  var self = this;

  self.sbatch = {};
  self.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n';
  self.sbatchScript = '';
  self.form = {};
  self.profile = '';

  self.formConfig = ScheduleService.getFormConfig();
  self.saveScript = function() {
    var contents = self.sbatchScript;
    var saveScriptModalInstance = $modal.open({
      templateUrl: '/static/slurm/templates/modals/savescript.modal.html',
      controller: 'SaveScriptCtrl',
      controllerAs: 'ctrl',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      resolve: {
        action: function () {
          return 'save';
        }
      }
    });
    saveScriptModalInstance.result.then(
      function(filepath) {
        ScheduleService.saveScript(filepath,contents);
      },
      function(filepath) {
        $log.debug('Modal dismissed at: ' + new Date());
      }
    );
  };
  self.submitScript = function() {
    var contents = self.sbatchScript;
    var submitScriptModalInstance = $modal.open({
      templateUrl: '/static/slurm/templates/modals/savescript.modal.html',
      controller: 'SaveScriptCtrl',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      resolve: {
        action: function () {
          return 'submit';
        }
      }
    });
    submitScriptModalInstance.result.then(
      function(filepath) {
        ScheduleService.submitScript(
          filepath,
          contents,
          function(data, status) {
            var submitStatusModalInstance = $modal.open({
              templateUrl: '/static/slurm/templates/modals/submitstatus.modal.html',
              controller: 'SubmitStatusCtrl',
              // size: 'lg',
              resolve: {
                data: function () {
                  return data;
                },
                status: function() {
                  return status;
                }
              }
            });
          },
          function(data, status) {
            var submitStatusModalInstance = $modal.open({
              templateUrl: '/static/slurm/templates/modals/submitstatus.modal.html',
              controller: 'SubmitStatusCtrl',
              // size: 'lg',
              resolve: {
                data: function () {
                  return data;
                },
                status: function() {
                  return status;
                }
              }
            });
          }
        );
      },
      function(filepath) {
        $log.debug('Modal dismissed at: ' + new Date());
      }
    );
  };
  self.getEstimate = function() {
    var estimateModalInstance = $modal.open({
      templateUrl: '/static/slurm/templates/modals/estimate.modal.html',
      controller: 'EstimateCtrl',
      size: 'lg',
      resolve: {
        sbatch: function () {
          return self.sbatch;
        }
      }
    });
  };

  self.loadScript = function() {
    var loadScriptModalInstance = $modal.open({
      templateUrl: '/static/slurm/templates/modals/loadscript.modal.html',
      controller: 'LoadScriptCtrl',
      size: 'lg'
    });
    loadScriptModalInstance.result.then(
      function(filepath) {
        ScheduleService.loadScript(filepath, function(response) {
          var fullScript = response.content.split('\n');
          var dirs = {}
          var renderScript = ''
          // Separate script components
          for (var i=0;i<fullScript.length;i++) {
            if (fullScript[i].startsWith('#!/bin/bash')) {
              continue;
            } else if (fullScript[i].startsWith('#SBATCH')) {
              var cmp = fullScript[i].replace('#SBATCH --','').split('=');
              dirs[cmp[0]] = cmp[1];
            } else {
              renderScript += fullScript[i] + '\n';
            }
          }
          // Trim extra white space at tail
          renderScript = renderScript.trim();
          renderScript += '\n';
          // Determine profile from directives
          var qos = dirs.qos;
          var partition = dirs.partition;
          var matchedProfile;
          for (var pname in self.formConfig.profiles) {
            if (
              (self.formConfig.profiles[pname].schema.properties.qos.default == qos)
              &&
              (self.formConfig.profiles[pname].schema.properties.partition.default == partition)
            ) {
              matchedProfile = pname;
              break;
            }
          }
          // Default to custom profile if none matched
          if (!matchedProfile) {
            matchedProfile = 'custom';
          }
          // Validate data types
          var props = self.formConfig.profiles[matchedProfile].schema.properties;
          for (var k in dirs) {
            if ((props[k].type === 'integer') || (props[k].type === 'number')) {
              if (typeof dirs[k] !== 'number') {
                dirs[k] = Number(dirs[k]);
              }
            }
          }
          // Push to interface
          $rootScope.$emit('sa:set-form-contents', matchedProfile, dirs);
          self.script = renderScript;
        });
      },
      function(filepath) {
        $log.debug('Modal dismissed at: ' + new Date());
      }
    );
  };
}])
.controller('SubmitStatusCtrl', ['$scope','$modalInstance','data','status',function($scope,$modalInstance,data,status) {
  $scope.successful = status === 200;
  $scope.output = data.output;
  $scope.dismiss = function () {
    $modalInstance.dismiss('dismiss');
  };
}])
.controller('EstimateCtrl', ['$scope','$modalInstance','sbatch',function($scope,$modalInstance,sbatch) {
  $scope.sbatch = sbatch;
  // nodes * time (min) * 12 (no node sharing)
  $scope.estimate = {
    su: NaN,
    reason: 'No node count specified.'
  };

  $scope.dismiss = function () {
    $modalInstance.dismiss('cancel');
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
}])
.controller('SaveScriptCtrl', ['$scope','$modalInstance','action',function($scope,$modalInstance,action) {
  if (action === 'save') {
    $scope.title = "Save Script As";
  } else if (action === 'submit') {
    $scope.title = "Save & Schedule Script";
  }
  $scope.treeData = {
    filetreeContents: [],
    selectedNodes: []
  };

  $scope.newFile = {
    filename: '',
    filepath: '-/'
  }
  $scope.invalidFilepath = true;

  $scope.$watch(function(){
    return $scope.treeData.selectedNodes;
  }, function(newValue){
    if(newValue.length > 0) {
      if (newValue[0].type === 'file') {
        $scope.newFile.filename = newValue[0].filename;
        $scope.newFile.filepath = newValue[0].filepath.replace(newValue[0].filename,'');
      } else {
        $scope.newFile.filepath = newValue[0].filepath;
      }
    }
    $scope.updateSaveName();
  });

  $scope.updateSaveName = function () {
    if (($scope.newFile.filepath.substr(0,1) !== '-') && (typeof $scope.newFile.filename !== 'undefined')) {
      $scope.invalidFilepath = false;
    }
  };

  $scope.saveAs = function () {
    var filepath = $scope.newFile.filepath + $scope.newFile.filename;
    if (filepath.substr(filepath.length-3) !== '.sh') {
      filepath += '.sh';
    }
    $modalInstance.close(filepath);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}])
.controller('LoadScriptCtrl', ['$scope','$modalInstance',function($scope,$modalInstance) {
  $scope.treeData = {
    filetreeContents: [],
    selectedNodes: []
  };

  $scope.loadFile = {
    filename: '',
    filepath: '-/'
  }
  $scope.invalidFilepath = true;

  $scope.$watch(function(){
    return $scope.treeData.selectedNodes;
  }, function(newValue){
    if ((newValue.length > 0) && (newValue[0].type === 'file')) {
      $scope.loadFile.filename = newValue[0].filename;
      $scope.loadFile.filepath = newValue[0].filepath.replace(newValue[0].filename,'');
      $scope.invalidFilepath = false;
    }
  });

  $scope.loadScript = function () {
    var filepath = $scope.loadFile.filepath + $scope.loadFile.filename;
    $modalInstance.close(filepath);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
