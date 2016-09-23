/**
  * @module sandstone.slurm.sa-assistform
  * This directive contains the assist form for generating
  * sbatch directives. The format, validation, and fields of
  * the form are dynamic, and determined by a configurable
  * JSON schema that is loaded from the backend during bootstrap.
  */
'use strict';

angular.module('sandstone.slurm')

.directive('saAssistForm', [function() {
  return {
    restrict: 'A',
    scope: {
      config: '=',
      sbatch: '=',
      form: '=',
      selectedProfile: '=profile'
    },
    templateUrl: '/static/slurm/templates/sa-assistform.html',
    controller: function($scope,$element,$timeout) {
      $scope.selectedProfile = '';
      // Exposed on the scope for unit testing.
      $scope.fieldNames = [];

      var updateFieldNames = function() {
        // Add fields
        for (var k in $scope.sbatch) {
          if ($scope.fieldNames.indexOf(k) < 0) {
            $scope.fieldNames.push(k);
          }
        }
        // Remove fields
        for (var i=$scope.fieldNames.length-1;i>=0;i--) {
          if (!($scope.fieldNames[i] in $scope.sbatch)) {
            $scope.fieldNames.splice(i,1);
          }
        }
      };

      $scope.$watch(
        function() {
          return $scope.selectedProfile;
        },
        function(newVal) {
          if (newVal) {
            $scope.selectProfile();
          } else {
            $scope.selectedProfile = '';
          }
        }
      );

      $scope.$watch(
        function() {
          return $scope.sbatch;
        },
        function(newVal) {
          updateFieldNames();
        },
        true
      );

      /**
        * @function getFields
        * @returns {array} fields A list of JSON schema properties to render as fields in the form.
        */
      $scope.getFields = function() {
        var fields = [];
        if (!$scope.selectedProfile) {
          return fields;
        }
        if (!($scope.selectedProfile in $scope.config.profiles)) {
          return fields;
        }

        var schema = $scope
          .config
          .profiles[$scope.selectedProfile]
          .schema;

        for (var i=0;i<$scope.fieldNames.length;i++) {
          var s = schema.properties[$scope.fieldNames[i]];
          fields.push(s);
        }

        return fields;
      };

      $scope.addField = function(prop) {
        if (prop) {
          $scope.fieldNames.push(prop);
        }
      };

      /**
        * @function removeField
        * @param {object} field The JSON schema property object corresponding to the
        * form field to be removed.
        */
      $scope.removeField = function(field) {
        var i;
        i = $scope.fieldNames.indexOf(field.title);
        if (i >= 0) {
          delete $scope.sbatch[field.title];
          $scope.fieldNames.splice(i, 1);
        }
      };

      /**
        * @function resetDefaults
        * This function is only responsible for clearing form data. Reinitializing
        * valid start state for the assist form occurs in $scope.selectProfile().
        */
      $scope.resetDefaults = function() {
        $scope.fieldNames = [];
        $scope.sbatch = {};
        $scope.selectProfile();
      };

      /**
        * @function onTypeaheadKey
        * This is the event handler bound to the typeahead field, called
        * when the user hits enter.
        */
      $scope.onTypeaheadKey = function($event) {
        if ($event.which===13){
          var sel = $scope.selectedProp;
          var props = $scope.getProperties();
          if (props.indexOf(sel) >= 0) {
            $scope.fieldNames.push(sel);
            $scope.selectedProp = '';
          }
        }
      };

      /**
        * @function getProperties
        * @returns {array} props List of JSON schema property names for the selected profile.
        */
      $scope.getProperties = function() {
        var props = [];
        try {
          for (var p in $scope.config.profiles[$scope.selectedProfile].schema.properties) {
            if (!$scope.form.hasOwnProperty(p)) {
              props.push(p);
            }
          }
        } catch(err) {}
        return props;
      };

      /**
        * @function getProfiles
        * @returns {array} profiles A list of available profiles
        */
      $scope.getProfiles = function() {
        var keys = [];
        for (var k in $scope.config.profiles) keys.push(k);
        return keys;
      };

      $scope.selectProfile = function() {
        var i, k;
        updateFieldNames();
        if (!$scope.selectedProfile) {
          return;
        }
        if (!($scope.selectedProfile in $scope.config.profiles)) {
          return;
        }
        var prof = $scope.config.profiles[$scope.selectedProfile];
        if (prof.schema.hasOwnProperty('required')) {
          for (i=0;i<prof.schema.required.length;i++) {
            k = prof.schema.required[i];
            if ($scope.fieldNames.indexOf(k) < 0) {
              $scope.fieldNames.push(k);
            }
            if (prof.schema.properties[k].hasOwnProperty('default')) {
              if (prof.schema.properties[k].readonly) {
                $scope.sbatch[k] = prof.schema.properties[k].default;
              } else if (!$scope.sbatch.hasOwnProperty(k)) {
                $scope.sbatch[k] = prof.schema.properties[k].default;
              }
            }
          }
        }
        if (prof.schema.hasOwnProperty('initial')) {
          for (i=0;i<prof.schema.initial.length;i++) {
            k = prof.schema.initial[i];
            if ($scope.fieldNames.indexOf(k) < 0) {
              $scope.fieldNames.push(k);
            }
            if (prof.schema.properties[k].hasOwnProperty('default')) {
              if (!$scope.sbatch.hasOwnProperty(k)) {
                $scope.sbatch[k] = prof.schema.properties[k].default;
              }
            }
          }
        }
      };
    }
  };
}]);
