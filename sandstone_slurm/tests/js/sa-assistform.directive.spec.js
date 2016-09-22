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
    type: "string"
  }
  var nodeProp = {
    description: "node description",
    minimum: 1,
    title: "nodes",
    type: "number"
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

    it('getFields', function() {
      // Must provide values for $scope.selectedProfile
      // and for $scope.sbatch in order to isolate getFields()
      // functionality.
      //
      // Should start empty, as '' is selected profile
      isolateScope.selectedProfile = '';
      $scope.$digest();
      var fields = isolateScope.getFields();
      expect(fields).toEqual([]);
      // Select valid profiles
      isolateScope.selectedProfile = 'test1';
      isolateScope.sbatch = {
        'time': '00:30:00',
        'account': 'test_acct'
      }
      $scope.$digest();
      fields = isolateScope.getFields();
      expect(fields).toEqual([timeProp2,acctProp]);
      isolateScope.selectedProfile = 'test2';
      isolateScope.sbatch = {
        'time': '00:30:00'
      }
      $scope.$digest();
      fields = isolateScope.getFields();
      expect(fields).toEqual([timeProp]);
      // Select invalid profile
      // should return empty field array
      isolateScope.selectedProfile = 'fake';
      isolateScope.sbatch = {
        'time': '00:30:00',
        'account': 'test_acct'
      }
      $scope.$digest();
      fields = isolateScope.getFields();
      expect(fields).toEqual([]);
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
