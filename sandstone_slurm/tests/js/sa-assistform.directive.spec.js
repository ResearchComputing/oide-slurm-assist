describe('sandstone.slurm.sa-assistform', function() {
  var baseElement = '<div sa-assist-form config="config" sbatch="sbatch" form="form" profile="profile"></div>';

  var acctProp = {
    description: "account description",
    enum: ['test_acct1','test_acct2'],
    title: "account",
    type: "string"
  };
  var timeProp = {
    description: "time description",
    minDuration: 0,
    pattern: /^(\d+-)?(\d+):(\d+):(\d+)$/,
    subtype: "duration",
    title: "time",
    type: "string"
  };
  var timeProp2 = {
    default: "00:30:00",
    description: "time description",
    minDuration: 0,
    maxDuration: 60,
    pattern: /^(\d+-)?(\d+):(\d+):(\d+)$/,
    subtype: "duration",
    title: "time",
    type: "string",
    readonly: true
  };
  var nodeProp = {
    description: "node description",
    minimum: 1,
    title: "nodes",
    type: "number"
  };
  var nodeProp2 = {
    description: "node description",
    minimum: 1,
    title: "node",
    type: "number",
    default: 3
  };
  var invalidProp = {
    description: "invalid description",
    minimum: 1,
    title: "invalid",
    type: "number"
  };
  var testConfig = {
    features: [],
    gres: [],
    profiles: {
      test1: {
        // initial: ['time'],
        schema: {
          properties: {
            account: acctProp,
            time: timeProp2,
            node: nodeProp
          },
          required: ['account','time'],
          title: "SlurmConfig",
          type: "object"
        }
      },
      test2: {
        initial: ['time','account'],
        schema: {
          properties: {
            account: acctProp,
            time: timeProp,
            node: nodeProp
          },
          title: "SlurmConfig",
          type: "object"
        }
      },
      test3: {
        initial: ['time','node'],
        schema: {
          properties: {
            account: acctProp,
            time: timeProp,
            node: nodeProp2
          },
          title: "SlurmConfig",
          type: "object"
        }
      },
      custom: {
        initial: [],
        schema: {
          properties: {
            account: acctProp,
            time: timeProp,
            node: nodeProp
          },
          title: "SlurmConfig",
          type: "object"
        }
      }
    }
  };

  beforeEach(module('sandstone'));
  beforeEach(module('sandstone.templates'));
  beforeEach(module('sandstone.slurm'));

  describe('controller', function() {
    var $compile, $scope, isolateScope, element;

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.config = angular.copy(testConfig);
      $scope.sbatch = {};
      $scope.form = {};
      $scope.profile = '';
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('$rootScope.$on: sa:set-form-contents', function() {
      spyOn(isolateScope,'setFormContents');
      $scope.$emit('sa:set-form-contents','test1',{'time':'00:30:00'});
      expect(isolateScope.setFormContents.calls.argsFor(0)).toEqual(['test1',{'time':'00:30:00'}]);
    });

    it('$watch: $scope.selectedProfile', function() {
      spyOn(isolateScope,'selectProfile');
      isolateScope.selectedProfile = 'test1';
      expect(isolateScope.selectProfile.calls.count()).toEqual(0);
      $scope.$digest();
      expect(isolateScope.selectProfile.calls.count()).toEqual(1);
      isolateScope.selectedProfile = null;
      $scope.$digest();
      expect(isolateScope.selectProfile.calls.count()).toEqual(1);
    });

    it('getFields', function() {
      // Must provide values for $scope.selectedProfile
      // and for $scope.fieldNames in order to isolate getFields()
      // functionality.
      //
      // Should start empty, as '' is selected profile
      isolateScope.selectedProfile = '';
      var fields = isolateScope.getFields();
      expect(fields).toEqual([]);
      // Select valid profiles
      isolateScope.selectedProfile = 'test1';
      isolateScope.fieldNames = ['time','account'];
      fields = isolateScope.getFields();
      expect(fields).toEqual([timeProp2,acctProp]);
      isolateScope.selectedProfile = 'test2';
      isolateScope.fieldNames = ['time'];
      fields = isolateScope.getFields();
      expect(fields).toEqual([timeProp]);
      // Select invalid profile
      // should return empty field array
      isolateScope.selectedProfile = 'fake';
      isolateScope.fieldNames = ['time','account'];
      fields = isolateScope.getFields();
      expect(fields).toEqual([]);
    });

    it('addField', function() {
      isolateScope.selectedProfile = 'test1';
      // no selected prop
      isolateScope.fieldNames = [];
      isolateScope.selectedProp = undefined;
      isolateScope.addField();
      expect(isolateScope.fieldNames).toEqual([]);
      // invalid prop
      isolateScope.fieldNames = [];
      isolateScope.selectedProp = 'invalid';
      isolateScope.addField();
      expect(isolateScope.fieldNames).toEqual([]);
      // valid props
      isolateScope.fieldNames = [];
      isolateScope.selectedProp = 'time';
      isolateScope.addField();
      expect(isolateScope.fieldNames).toEqual(['time']);
      isolateScope.selectedProp = 'account';
      isolateScope.addField();
      expect(isolateScope.fieldNames).toEqual(['time','account']);
    });

    it('removeField', function() {
      isolateScope.fieldNames = ['time','account'];
      isolateScope.sbatch = {
        'time': '00:30:00',
        'account': 'test_acct'
      }
      isolateScope.removeField(timeProp);
      expect(isolateScope.fieldNames).toEqual(['account']);
      expect(isolateScope.sbatch).toEqual({'account': 'test_acct'});
      // Test removing an invalid field
      isolateScope.removeField({});
      expect(isolateScope.fieldNames).toEqual(['account']);
      expect(isolateScope.sbatch).toEqual({'account': 'test_acct'});
      // Test removing from empty list
      isolateScope.fieldNames = [];
      isolateScope.sbatch = {}
      isolateScope.removeField(timeProp);
      expect(isolateScope.fieldNames).toEqual([]);
      expect(isolateScope.sbatch).toEqual({});
    });

    it('resetDefaults', function() {
      isolateScope.selectedProfile = 'test1';
      isolateScope.fieldNames = ['time'];
      isolateScope.sbatch = {time: '00:30:00'};
      spyOn(isolateScope,'selectProfile');
      isolateScope.resetDefaults();
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.fieldNames).toEqual([]);
      expect(isolateScope.sbatch).toEqual({});
      expect(isolateScope.selectProfile).toHaveBeenCalled();
    });

    it('setFormContents', function() {
      var prof, dirs;
      // Start with empty form
      prof = 'test1';
      dirs = {time: '00:30:00'};
      isolateScope.selectedProfile = '';
      isolateScope.fieldNames = [];
      isolateScope.sbatch = {};
      isolateScope.setFormContents(prof,dirs);
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.fieldNames).toEqual(['time']);
      expect(isolateScope.sbatch).toEqual({time: '00:30:00'});
      // Start with populated form, same prof, different dirs
      dirs = {account: 'test_acct1'};
      isolateScope.setFormContents(prof,dirs);
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.fieldNames).toEqual(['account']);
      expect(isolateScope.sbatch).toEqual({account: 'test_acct1'});
      // Start populated, diff prof, diff dirs
      prof = 'test3'
      dirs = {time: '00:30:00', account: 'test_acct2'};
      isolateScope.setFormContents(prof,dirs);
      expect(isolateScope.selectedProfile).toEqual('test3');
      expect(isolateScope.fieldNames).toEqual(['time','account']);
      expect(isolateScope.sbatch).toEqual({time: '00:30:00', account: 'test_acct2'});
    });

    it('getProperties', function() {
      isolateScope.selectedProfile = 'test1';
      var props = isolateScope.getProperties();
      expect(props).toEqual(['account','time','node']);
      isolateScope.selectedProfile = 'test2';
      props = isolateScope.getProperties();
      expect(props).toEqual(['account','time','node']);
      // No profile selected
      isolateScope.selectedProfile = '';
      props = isolateScope.getProperties();
      expect(props).toEqual([]);
      // Invalid profile selected
      isolateScope.selectedProfile = 'invalid';
      props = isolateScope.getProperties();
      expect(props).toEqual([]);
    });

    it('getProfiles', function() {
      var profiles = isolateScope.getProfiles();
      expect(profiles).toEqual(['test1','test2','test3','custom']);
    });

    it('selectProfile', function() {
      spyOn(isolateScope,'applyRequired');
      spyOn(isolateScope,'applyInitial');
      // No profile selected
      isolateScope.selectedProfile = '';
      isolateScope.selectProfile();
      expect(isolateScope.selectedProfile).toEqual('');
      expect(isolateScope.applyRequired.calls.count()).toEqual(0);
      expect(isolateScope.applyInitial.calls.count()).toEqual(0);
      // Invalid profile selected
      isolateScope.selectedProfile = 'invalid';
      isolateScope.selectProfile();
      expect(isolateScope.selectedProfile).toEqual('invalid');
      expect(isolateScope.applyRequired.calls.count()).toEqual(0);
      expect(isolateScope.applyInitial.calls.count()).toEqual(0);
      // Valid profile selected
      isolateScope.selectedProfile = 'test2';
      isolateScope.applyRequired.and.returnValue(true);
      isolateScope.applyInitial.and.returnValue(true);
      isolateScope.selectProfile();
      expect(isolateScope.selectedProfile).toEqual('test2');
      expect(isolateScope.applyRequired.calls.count()).toEqual(1);
      expect(isolateScope.applyInitial.calls.count()).toEqual(1);
    });

    it('applyRequired', function() {
      // No required
      var profile = testConfig.profiles['test2'];
      isolateScope.fieldNames = [];
      isolateScope.sbatch = {};
      isolateScope.applyRequired(profile);
      expect(isolateScope.fieldNames).toEqual([]);
      expect(isolateScope.sbatch).toEqual({});
      // Required, no conflict
      profile = testConfig.profiles['test1'];
      isolateScope.fieldNames = [];
      isolateScope.sbatch = {};
      isolateScope.applyRequired(profile);
      expect(isolateScope.fieldNames).toEqual(['account','time']);
      expect(isolateScope.sbatch).toEqual({'time':'00:30:00'});
      // Required, conflict
      profile = testConfig.profiles['test1'];
      isolateScope.fieldNames = ['time','account','node'];
      isolateScope.sbatch = {
        'time':'00:45:00',
        'account': 'test_acct1'
      };
      isolateScope.applyRequired(profile);
      expect(isolateScope.fieldNames).toEqual(['time','account','node']);
      expect(isolateScope.sbatch).toEqual({
        'time':'00:30:00',
        'account': 'test_acct1'
      });
    });

    it('applyInitial', function() {
      // No initial
      var profile = testConfig.profiles['custom'];
      isolateScope.fieldNames = [];
      isolateScope.sbatch = {};
      isolateScope.applyInitial(profile);
      expect(isolateScope.fieldNames).toEqual([]);
      expect(isolateScope.sbatch).toEqual({});
      // Initial, no conflict
      var profile = testConfig.profiles['test3'];
      isolateScope.fieldNames = [];
      isolateScope.sbatch = {};
      isolateScope.applyInitial(profile);
      expect(isolateScope.fieldNames).toEqual(['time','node']);
      expect(isolateScope.sbatch).toEqual({'node': 3});
      // Initial, conflict
      profile = testConfig.profiles['test3'];
      isolateScope.fieldNames = ['node','account'];
      isolateScope.sbatch = {
        'account':'test_acct1',
        'node': 4
      };
      isolateScope.applyInitial(profile);
      expect(isolateScope.fieldNames).toEqual(['node','account','time']);
      expect(isolateScope.sbatch).toEqual({
        'account':'test_acct1',
        'node': 4
      });
    });
  });

  describe('directive', function() {
    var $compile, $scope, isolateScope, element;
    // Grab form fields from template html
    var getFieldsFromTpl = function(tpl) {
      var matches = tpl.match(/ngInclude([\s\S]*?)end ngRepeat: field in getFields/g);
      if (!matches) {
        return [];
      }
      return matches;
    };

    var renderTpl = function(scope,el) {
      var tpl;
      scope.$digest();
      tpl = el.html();
      return tpl;
    };

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.config = angular.copy(testConfig);
      $scope.sbatch = {};
      $scope.form = {};
      $scope.profile = '';
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('select a profile', function() {
      var tpl, fields;
      // All profiles are listed, no profile is selected
      isolateScope.selectedProfile = '';
      $scope.$digest();
      tpl = element.html();
      expect(tpl).toContain('string:test1');
      expect(tpl).toContain('string:test2');
      expect(tpl).toContain('string:test3');
      expect(tpl).toContain('string:custom');
      // Select first profile
      isolateScope.selectedProfile = 'test1';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(fields.length).toEqual(2);
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.fieldNames).toEqual(['account','time'])
      // First field should be account, no value
      expect(fields[0]).toContain('account');
      expect(isolateScope.sbatch.hasOwnProperty('account')).toBeFalsy();
      // validate field setup
      expect(fields[0]).toContain('name="account"');
      expect(fields[0]).toContain('ng-required="true"');
      // validate enum
      expect(fields[0]).toContain('string:test_acct1');
      expect(fields[0]).toContain('string:test_acct2');
      // Second field should be time, with value
      expect(fields[1]).toContain('time');
      expect(isolateScope.sbatch.time).toEqual('00:30:00');
      expect($scope.sbatch.time).toEqual('00:30:00');
      // validate field setup
      expect(fields[1]).toContain('name="time"');
      expect(fields[1]).toContain('ng-required="true"');
      expect(fields[1]).toContain('readonly="readonly"');
      expect(fields[1]).toContain('min-duration');
      expect(fields[1]).toContain('max-duration');
      expect(fields[1]).toContain('ng-pattern=');
      expect(fields[1]).toContain('ng-model="sbatch[field.title]"');
      expect(fields[1]).toContain('time: time description');

      // Select second profile
      isolateScope.selectedProfile = 'test3';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(fields.length).toEqual(3);
      expect(isolateScope.selectedProfile).toEqual('test3');
      expect(isolateScope.fieldNames).toEqual(['account','time','node'])
      // First field should be account, no value
      expect(fields[0]).toContain('account');
      expect(isolateScope.sbatch.hasOwnProperty('account')).toBeFalsy();
      // Second field should be time, with value
      expect(fields[1]).toContain('time');
      expect(isolateScope.sbatch.time).toEqual('00:30:00');
      expect($scope.sbatch.time).toEqual('00:30:00');
      expect(fields[1]).toContain('name="time"');
      // Third field should be node, with value
      expect(fields[2]).toContain('node');
      expect(isolateScope.sbatch.node).toEqual(3);
      expect($scope.sbatch.node).toEqual(3);
      expect(fields[2]).toContain('name="node"');

      // Select third profile
      isolateScope.selectedProfile = 'custom';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(fields.length).toEqual(3);
      expect(isolateScope.selectedProfile).toEqual('custom');
      expect(isolateScope.fieldNames).toEqual(['account','time','node'])
      // First field should be account, no value
      expect(fields[0]).toContain('account');
      expect(isolateScope.sbatch.hasOwnProperty('account')).toBeFalsy();
      // Second field should be time, with value
      expect(isolateScope.sbatch.time).toEqual('00:30:00');
      expect($scope.sbatch.time).toEqual('00:30:00');
      expect(fields[1]).toContain('name="time"');
      // Third field should be node, with value
      expect(isolateScope.sbatch.node).toEqual(3);
      expect($scope.sbatch.node).toEqual(3);
      expect(fields[2]).toContain('name="node"');

      // Conflicting required values upon switch
      isolateScope.selectedProfile = 'test1';
      isolateScope.sbatch.time = '00:45:00';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(fields.length).toEqual(3);
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.fieldNames).toEqual(['account','time','node'])
      // Second field should be time, with required value
      expect(isolateScope.sbatch.time).toEqual('00:30:00');
      expect($scope.sbatch.time).toEqual('00:30:00');
      expect(fields[1]).toContain('name="time"');
    });

    it('add a field to the form', function() {
      // Profile must be selected to add fields
      isolateScope.selectedProfile = 'test1';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['account','time']);
      expect(fields.length).toEqual(2);
      // Add a field, selectedProp empty
      isolateScope.selectedProp = '';
      isolateScope.addField();
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['account','time']);
      expect(fields.length).toEqual(2);
      expect(isolateScope.selectedProp).toEqual('');
      // Add a field, selectedProp invalid
      isolateScope.selectedProp = 'invalid';
      isolateScope.addField();
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['account','time']);
      expect(fields.length).toEqual(2);
      expect(isolateScope.selectedProp).toEqual('invalid');
      // Add a field, selectedProp already in form
      isolateScope.selectedProp = 'time';
      isolateScope.addField();
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['account','time']);
      expect(fields.length).toEqual(2);
      expect(isolateScope.selectedProp).toEqual('time');
      // Add a field, selectedProp valid
      isolateScope.selectedProp = 'node';
      isolateScope.addField();
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['account','time','node']);
      expect(fields.length).toEqual(3);
      expect(isolateScope.selectedProp).toEqual('');
      expect(fields[2]).toContain('name="nodes"');
    });

    it('remove a field', function() {
      // Profile must be selected for form to show
      isolateScope.selectedProfile = 'test2';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['time','account']);
      isolateScope.sbatch.time = '00:45:00';
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.sbatch).toEqual({'time':'00:45:00'});
      expect(fields.length).toEqual(2);
      // Remove invalid field
      isolateScope.removeField(invalidProp);
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['time','account']);
      expect(isolateScope.sbatch).toEqual({'time':'00:45:00'});
      expect(fields.length).toEqual(2);
      // Remove valid field with no value
      isolateScope.removeField(acctProp);
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual(['time']);
      expect(isolateScope.sbatch).toEqual({'time':'00:45:00'});
      expect(fields.length).toEqual(1);
      // Remove valid field with value
      isolateScope.removeField(timeProp);
      $scope.$digest();
      tpl = element.html()
      fields = getFieldsFromTpl(tpl);
      expect(isolateScope.fieldNames).toEqual([]);
      expect(isolateScope.sbatch).toEqual({});
      expect(fields.length).toEqual(0);
    });
  });
});
