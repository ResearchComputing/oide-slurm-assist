'use strict';

angular.module('sandstone.slurm')

.controller('ScheduleCtrl', ['$log','$uibModal','$rootScope','$q','ScheduleService','AlertService',function($log,$uibModal,$rootScope,$q,ScheduleService,AlertService) {
  var self = this;

  self.sbatch = {};
  self.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n';
  self.sbatchScript = '';
  self.form = {};
  self.profile = '';

  // Clear active file on load.
  ScheduleService.setActiveFile();

  self.formConfig = ScheduleService.getFormConfig();

  self.confirmOverwrite = function(filepath) {
    var confirmOverwriteModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/confirmoverwrite.modal.html',
      controller: 'ConfirmOverwriteCtrl',
      controllerAs: 'ctrl',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      resolve: {
        filepath: function () {
          return filepath;
        }
      }
    });
    return confirmOverwriteModalInstance.result;
  };

  self.saveScriptAs = function() {
    var deferredModal = $q.defer();
    var contents = self.sbatchScript;
    var saveScriptModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/saveas.modal.html',
      controller: 'SaveAsCtrl',
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
        var scriptSaved = ScheduleService.saveScript(filepath,contents);
        scriptSaved.then(function() {
          ScheduleService.setActiveFile(filepath);
          deferredModal.resolve(filepath);
        },function() {
          AlertService.addAlert({
            type: 'danger',
            message: 'Failed to save script ' + filepath
          });
          deferredModal.reject();
        });
      });
    return deferredModal.promise;
  };

  self.submitScript = function(filepath) {
    var deferredSubmitScript = $q.defer();
    var scriptScheduled = ScheduleService.submitScript(filepath);
    scriptScheduled.then(
      function(data) {
        var submitStatusModalInstance = $uibModal.open({
          templateUrl: '/static/slurm/templates/modals/submitstatus.modal.html',
          controller: 'SubmitStatusCtrl',
          resolve: {
            data: function () {
              return data;
            }
          }
        });
        deferredSubmitScript.resolve();
      },
      function(err) {
        AlertService.addAlert({
          type: 'danger',
          message: 'Failed to submit job. ' + err.data.output
        });
        deferredSubmitScript.reject();
      }
    );
    return deferredSubmitScript.promise;
  };

  self.scheduleScript = function() {
    // var deferredSaveSubmitScript = $q.defer();
    var contents = self.sbatchScript;
    var activeFile = ScheduleService.getActiveFile();

    var saveAs = function() {
      var scriptSavedAs = self.saveScriptAs();
      scriptSavedAs.then(self.submitScript);
    };

    if(!!activeFile) {

      var overwriteConfirmed = self.confirmOverwrite(activeFile);
      overwriteConfirmed.then(
        function(action) {
          if(action.overwrite) {
            var scriptSaved = ScheduleService.saveScript(activeFile,contents);
            scriptSaved.then(
              function() {
                self.submitScript(activeFile);
              },
              function() {
                AlertService.addAlert({
                  type: 'danger',
                  message: 'Failed to save script ' + filepath
                });
              }
            );
          } else {
            saveAs();
          }
        }
      );

    } else {
      saveAs();
    }
  };

  self.getEstimate = function() {
    var estimateModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/estimate.modal.html',
      controller: 'EstimateCtrl',
      size: 'lg',
      backdropClass: 'sandstone-modal-backdrop',
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
          ScheduleService.setActiveFile(filepath);
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
}]);
