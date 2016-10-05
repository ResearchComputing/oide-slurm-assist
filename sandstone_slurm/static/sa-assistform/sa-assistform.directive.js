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
    templateUrl: '/static/slurm/sa-assistform/sa-assistform.html',
    controller: function($scope,$element,$timeout,$rootScope) {
      // Listen for clear form event, used when a script is loaded.
      $rootScope.$on('sa:set-form-contents', function(e, prof, dirs) {
        $scope.setFormContents(prof, dirs);
      });

      $scope.selectedProfile = '';
      // Exposed on the scope for unit testing.
      $scope.fieldNames = [];

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
        * @function setFormContents
        * @param {string} prof The name of the profile to select
        * @param {object} dirs The sbatch directives to set
        * This function sets the form to a specified state.
        */
      $scope.setFormContents = function(prof, dirs) {
        $scope.selectedProfile = prof;
        $scope.sbatch = dirs;
        $scope.fieldNames = [];
        for (var k in $scope.sbatch) {
          $scope.fieldNames.push(k);
        }
      };

      /**
        * @function addField
        * This is the function bound to the add field button and the typeahead onSelect
        */
      $scope.addField = function() {
        var sel = $scope.selectedProp;
        var props = $scope.getProperties();
        if (props.indexOf(sel) >= 0) {
          $scope.fieldNames.push(sel);
          $scope.selectedProp = '';
        }
      };

      /**
        * @function propValid
        * @returns {boolean} isValid Whether or not $scope.selectedProp is valid
        */
      $scope.propValid = function() {
        var prop = $scope.selectedProp;

        // field name unspecified
        if (!prop) {
          return false;
        }
        // field exists
        if ($scope.fieldNames.indexOf(prop) >= 0) {
          return false;
        }
        // field name invalid
        if (!(prop in $scope.config.profiles[$scope.selectedProfile].schema.properties)) {
          return false;
        }
        return true;
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

      /**
        * @function selectProfile
        * Configures the assist form for the currently selected
        * profile. Existing form fields/values will be maintained
        * unless they present a conflict with the new schema, in which
        * case the inconsistencies will be reconciled.
        */
      $scope.selectProfile = function() {
        // No profile
        if (!$scope.selectedProfile) {
          return;
        }
        // Invalid profile
        if (!($scope.selectedProfile in $scope.config.profiles)) {
          return;
        }

        // Retrieve profile config, and apply required and intitial fields
        var prof = $scope.config.profiles[$scope.selectedProfile];
        $scope.applyRequired(prof);
        $scope.applyInitial(prof);
      };

      /**
        * @function applyRequired
        * @param {object} profile The config for the current profile
        * Applies required fields for current profile. Reconciles any
        * inconsistencies encountered.
        */
      $scope.applyRequired = function(profile) {
        var i, k;
        // Nothing to apply
        if (!profile.schema.hasOwnProperty('required')) {
          return;
        }
        // Apply required fields
        for (i=0;i<profile.schema.required.length;i++) {
          k = profile.schema.required[i];
          // Add field if not already in form
          if ($scope.fieldNames.indexOf(k) < 0) {
            $scope.fieldNames.push(k);
          }
          // Apply default values for field if present
          if (profile.schema.properties[k].hasOwnProperty('default')) {
            // If a field has a readonly default, this value must be
            // applied even if a current value exists.
            if (profile.schema.properties[k].readonly) {
              $scope.sbatch[k] = profile.schema.properties[k].default;
            } else if (!$scope.sbatch.hasOwnProperty(k)) {
              // If the default is not on a readonly field, apply it if
              // no current value exists.
              $scope.sbatch[k] = profile.schema.properties[k].default;
            }
          }
        }
      };

      /**
        * @function applyInitial
        * @param {object} profile The config for the current profile
        * Applies initial fields for current profile. Existing data will
        * be maintained when applying default values.
        */
      $scope.applyInitial = function(profile) {
        var i, k;
        // Nothing to apply
        if (!profile.hasOwnProperty('initial')) {
          return;
        }
        // Apply initial fields
        for (i=0;i<profile.initial.length;i++) {
          k = profile.initial[i];
          // Add fields if not already in form
          if ($scope.fieldNames.indexOf(k) < 0) {
            $scope.fieldNames.push(k);
          }
          // Apply defaults
          if (profile.schema.properties[k].hasOwnProperty('default')) {
            // Apply default value for fields if no current value exists.
            if (!$scope.sbatch.hasOwnProperty(k)) {
              $scope.sbatch[k] = profile.schema.properties[k].default;
            }
          }
        }
      };
    }
  };
}]);
