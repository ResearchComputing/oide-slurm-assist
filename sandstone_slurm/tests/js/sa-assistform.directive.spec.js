describe('sandstone.slurm.sa-assistform', function() {
  var $compile;
  var $scope;
  var isolateScope;
  var baseElement;

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

  beforeEach(inject(function(_$compile_,_$rootScope_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $scope.config = {};
    $scope.sbatch = {};
    $scope.form = {};
    $scope.profile = '';
    baseElement = '<div sa-assist-form config="config" sbatch="sbatch" form="form" profile="profile"></div>';
  }));

  describe('controller', function() {
    var element, ctrl;

    beforeEach(inject(function() {
      $scope.config = angular.copy(testConfig);
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('getFields', function() {
      isolateScope.selectedProfile = '';
      // Should start empty, as '' is selected profile
      var fields = isolateScope.getFields();
      expect(fields).toEqual([]);
      // Select valid profile
      isolateScope.selectedProfile = 'test1';
      fields = isolateScope.getFields();
      expect(fields).toEqual(['account','time','nodes']);
    });
  });
});
