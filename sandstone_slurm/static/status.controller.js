'use strict';

angular.module('sandstone.slurm')

.controller('StatusCtrl', ['$log','$uibModal','StatusService',function($log,$uibModal,StatusService) {
  var self = this;

  self.queueCollection = [];

  self.getters = {
    State: function(value){
      var ordered_states = ["RUNNING","PENDING","SUSPENDED","CANCELLED","COMPLETING",
                             "COMPLETED","CONFIGURING","FAILED","TIMEOUT","PREEMPTED",
                             "NODE_FAIL","SPECIAL_EXIT" ];
      var s = value.State;
      return ordered_states.indexOf(s);
    }
  };

  self.updateCollection = function() {
    StatusService.getJobList(function(response) {
      $log.debug(response);
      self.queueCollection = response;
    });
  };

  self.getDetails = function(row) {
    var detailModalInstance = $uibModal.open({
      templateUrl: '/static/slurm/templates/modals/jobdetail.modal.html',
      controller: 'DetailModalCtrl',
      size: 'lg',
      resolve: {
        job: function() {
          return row;
        }
      }
    });
  };
}])
.controller('DetailModalCtrl', ['$scope','$log','$uibModalInstance','job',function($scope,$log,$uibModalInstance,job) {
  $scope.job = job;

  var shortAttrList = [
    'JobID',
    'JobName',
    'QOS',
    'Partition',
    'Cluster',
    'Account',
    'CPUTime',
    'ReqCPUS',
    'AllocCPUS',
    'NNodes',
    'Start',
    'End',
    'TimeLimit',
  ];
  var fullAttrList = [];
  for (var i;i<shortAttrList.length;i++) {
    fullAttrList.push(shortAttrList[i]);
  }
  for (var a in job) {
    if (fullAttrList.indexOf(a) < 0) {
      fullAttrList.push(a);
    }
  }

  $scope.showAll = false;
  $scope.attrList = shortAttrList;

  $scope.toggleShowAll = function() {
    if (!$scope.showAll) {
      $scope.attrList = fullAttrList;
    } else {
      $scope.attrList = shortAttrList;
    }
    $scope.showAll = !$scope.showAll;
  };

  $scope.dismiss = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
