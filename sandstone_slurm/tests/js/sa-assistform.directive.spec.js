describe('sandstone.slurm.sa-assistform', function() {
  var baseElement = '<div sa-assist-form config="config" sbatch="sbatch" form="form" profile="profile"></div>';

  var acctProp = {
    description: "account description",
    enum: ['test_acct1','test_acct2'],
    title: "account",
    type: "string"
  }
  var timeProp = {
    description: "time description",
    minDuration: 0,
    pattern: "^(\d+-)?(\d+):(\d+):(\d+)$",
    subtype: "duration",
    title: "time",
    type: "string"
  }
  var timeProp2 = {
    default: "00:30:00",
    description: "time description",
    minDuration: 0,
    maxDuration: 60,
    pattern: "^(\d+-)?(\d+):(\d+):(\d+)$",
    subtype: "duration",
    title: "time",
    type: "string",
    readonly: true
  }
  var nodeProp = {
    description: "node description",
    minimum: 1,
    title: "nodes",
    type: "number"
  }
  var nodeProp2 = {
    description: "node description",
    minimum: 1,
    title: "nodes",
    type: "number",
    default: 3
  }
  var testConfig = {
    features: [],
    gres: [],
    profiles: {
      test1: {
        initial: ['time'],
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
  }

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
      isolateScope.fieldNames = [];
      isolateScope.addField('time');
      expect(isolateScope.fieldNames).toEqual(['time']);
      isolateScope.addField('account');
      expect(isolateScope.fieldNames).toEqual(['time','account']);
      isolateScope.addField('');
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

    it('onTypeaheadKey', function() {
      // Mock enter keypress event
      var e = {which: 13};
      isolateScope.selectedProfile = 'test1';
      isolateScope.fieldNames = [];
      isolateScope.selectedProp = 'time';
      isolateScope.onTypeaheadKey(e);
      expect(isolateScope.fieldNames).toEqual(['time']);
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.selectedProp).toEqual('');
      // Select an invalid property
      isolateScope.selectedProp = 'invalid';
      isolateScope.onTypeaheadKey(e);
      expect(isolateScope.fieldNames).toEqual(['time']);
      expect(isolateScope.selectedProfile).toEqual('test1');
      expect(isolateScope.selectedProp).toEqual('invalid');
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

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
    }));
  });
});
