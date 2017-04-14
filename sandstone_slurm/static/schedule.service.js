'use strict';

angular.module('sandstone.slurm')

.factory('ScheduleService', ['$http','$log','$q','FilesystemService','AlertService',function($http,$log,$q,FilesystemService,AlertService) {
  var formConfig;
  return {
    loadFormConfig: function() {
      return $http
        .get('/slurm/a/config')
        .success(function (data, status, headers, config) {
          $log.log(data);
          formConfig = data.formConfig;
        });
    },
    getFormConfig: function() {
      return formConfig;
    },
    loadScript: function(filepath) {
      var deferred = $q.defer();
      var deferredLoadScript = FilesystemService.getFileContents(filepath);
      deferredLoadScript.then(function(scriptContents) {
        deferred.resolve(scriptContents);
      },function(data,status) {
        deferred.reject(data,status);
      });
    },
    saveScript: function (filepath,content) {
      var deferred = $q.defer();

      var writeContents = function(contents) {
        var writeFile = FilesystemService.writeFileContents(filepath,content);
        writeFile.then(function(data) {
          deferred.resolve();
        },function(data,status) {
          deferred.reject();
        });
      };

      var createAndWriteContents = function(filepath,contents) {
        var createFile = FilesystemService.createFile(filepath);
        createFile.then(function(data) {
          writeContents(filepath,content);
        },function(data,status) {
          deferred.reject();
        });
      };

      var fileExists = FilesystemService.getFileDetails(filepath);
      fileExist.then(function(fileDetails) {
        writeContents(content);
      },function(data,status) {
        if(status === 404) {
          // Create the file first
          createAndWriteContents(filepath,content);
        }
      });

      return deferred.promise;
    },
    submitScript: function (filepath,content) {
      var deferred = $q.defer();

      var deferredSaveScript = ScheduleService.saveScript(filepath,content);
      deferredSaveScript.then(function() {
        $http({
          url: "/slurm/a/jobs",
          method: "POST",
          data:{'content': filepath}
        })
        .success(function(data, status, header, config) {
          $log.debug('Submitted: ', filepath);
          deferred.resolve(data, status);
        })
        .error(function(data, status, header, config) {
          $log.error("Submission failed:", data ,status, header, config);
          deferred.reject();
        });
      },function() {
        deferred.reject();
      });
    }
  };
}]);
