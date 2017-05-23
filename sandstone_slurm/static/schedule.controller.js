'use strict';

angular.module('sandstone.slurm')

.controller('ScheduleCtrl', ['$log','$uibModal','$rootScope','ScheduleService','AlertService',function($log,$uibModal,$rootScope,ScheduleService,AlertService) {
  var self = this;

  self.sbatch = {};
  self.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n';
  self.sbatchScript = '';
  self.form = {};
  self.profile = '';

  self.formConfig = ScheduleService.getFormConfig();
  self.saveScript = function() {
    var contents = self.sbatchScript;
    var saveScriptModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/savescript.modal.html',
      controller: 'SaveScriptCtrl',
      controllerAs: 'ctrl',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      resolve: {
        file: function () {
          var file = {
            name: '',
            dirpath: ''
          };
          return file;
        },
        action: function () {
          return 'save';
        }
      }
    });
    saveScriptModalInstance.result.then(
      function(filepath) {
        var deferredSaveScript = ScheduleService.saveScript(filepath,contents);
        deferredSaveScript.then(function() {},function() {
          AlertService.addAlert({
            type: 'danger',
            message: 'Failed to save script ' + filepath
          });
        });
      });
  };
  self.submitScript = function() {
    var contents = self.sbatchScript;
    var submitScriptModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/savescript.modal.html',
      controller: 'SaveScriptCtrl',
      controllerAs: 'ctrl',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      resolve: {
        file: function () {
          var file = {
            name: '',
            dirpath: ''
          };
          return file;
        },
        action: function () {
          return 'submit';
        }
      }
    });
    submitScriptModalInstance.result.then(
      function(filepath) {
        var deferredSubmitScript = ScheduleService.submitScript(filepath,contents);
        deferredSubmitScript.then(function(data) {
          var submitStatusModalInstance = $uibModal.open({
            templateUrl: '/static/slurm/templates/modals/submitstatus.modal.html',
            controller: 'SubmitStatusCtrl',
            // size: 'lg',
            resolve: {
              data: function () {
                return data;
              }
            }
          });
        },function() {
          AlertService.addAlert({
            type: 'danger',
            message: 'Failed to submit job.'
          });
        });
      });
  };
  self.getEstimate = function() {
    var estimateModalInstance = $uibModal.open({
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
    var loadScriptModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/loadscript.modal.html',
      controller: 'LoadScriptCtrl',
      controllerAs: 'ctrl',
      size: 'lg'
    });
    loadScriptModalInstance.result.then(
      function(filepath) {

        var onScriptLoad = function(contents) {
          var fullScript = contents.split('\n');
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
        };

        var deferredLoadScript = ScheduleService.loadScript(filepath);
        deferredLoadScript.then(onScriptLoad,function() {
          AlertService.addAlert({
            type: 'danger',
            message: 'Failed to load script ' + filepath
          });
        });
      });
  };
}])
.controller('SubmitStatusCtrl', ['$scope','$uibModalInstance','data',function($scope,$uibModalInstance,data) {
  $scope.output = data.output;
  $scope.dismiss = function () {
    $uibModalInstance.dismiss('dismiss');
  };
}])
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
}])
.controller('SaveScriptCtrl', ['$scope','$uibModalInstance','file','action', 'FilesystemService',function($scope,$uibModalInstance,file,action,FilesystemService) {
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
}])
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
