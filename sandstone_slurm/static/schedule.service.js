'use strict';

angular.module('sandstone.slurm')

.factory('ScheduleService', ['$http','$log','$q','FilesystemService','AlertService',function($http,$log,$q,FilesystemService,AlertService) {
  var formConfig;
  var activeFile = undefined;

  var getActiveFile = function() {
    return activeFile;
  };
  var setActiveFile = function(filepath) {
    var fp = undefined;
    if(filepath) {
      fp = filepath;
    }
    activeFile =  fp;
  };

  var saveScript = function (filepath,content) {
    var deferred = $q.defer();

    var writeContents = function(contents) {
      var writeFile = FilesystemService.writeFileContents(filepath,content);
      writeFile.then(function(data) {
        setActiveFile(filepath);
        deferred.resolve();
      },function(data) {
        setActiveFile();
        deferred.reject();
      });
    };

    var createAndWriteContents = function(filepath,contents) {
      var createFile = FilesystemService.createFile(filepath);
      createFile.then(function(data) {
        writeContents(filepath,content);
      },function(data) {
        deferred.reject();
      });
    };

    var fileExists = FilesystemService.getFileDetails(filepath);
    fileExists.then(function(fileDetails) {
      writeContents(content);
    },function(data) {
      if(data.status === 404) {
        // Create the file first
        createAndWriteContents(filepath,content);
      }
    });

    return deferred.promise;
  };

  return {
    getActiveFile: getActiveFile,
    setActiveFile: setActiveFile,
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
      },function(data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },
    saveScript: saveScript,
    submitScript: function (filepath) {
      var deferred = $q.defer();
      var deferredSubmitScript = $http({
        url: "/slurm/a/jobs",
        method: "POST",
        data:{'content': filepath}
      })
      .success(function(data, status, header, config) {
        $log.debug('Submitted: ', filepath);
        deferred.resolve(data);
      })
      .error(function(data, status, header, config) {
        $log.error("Submission failed:", data ,status, header, config);
        deferred.reject({data:data,status:status});
      });
      return deferred.promise;
    }
  };
}]);
