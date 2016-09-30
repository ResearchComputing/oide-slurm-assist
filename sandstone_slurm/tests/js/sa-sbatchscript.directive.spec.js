describe('sandstone.slurm.sa-sbatchscript', function() {
  var baseElement = '<div sa-sbatch-script sbatch="sbatch" script="script" sbatch-script="sbatchScript">';

  beforeEach(module('sandstone'));
  beforeEach(module('sandstone.templates'));
  beforeEach(module('sandstone.slurm'));

  describe('controller', function() {
    var $compile, $scope, isolateScope, element;

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.sbatch = {};
      $scope.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n';
      $scope.sbatchScript = '';
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('$watch: $scope.sbatch', function() {
      spyOn(isolateScope,'compileScript');
      isolateScope.sbatch = {'test':'test'};
      $scope.$digest();
      expect(isolateScope.compileScript.calls.argsFor(0)).toEqual([{'test': 'test'}]);
    });

    it('$watch: $scope.script', function() {
      spyOn(isolateScope,'compileScript');
      isolateScope.sbatch = {'test':'test'};
      $scope.$digest();
      expect(isolateScope.compileScript.calls.argsFor(0)).toEqual([{'test': 'test'}]);
      isolateScope.script = 'testing watch\n';
      $scope.$digest();
      expect(isolateScope.compileScript.calls.argsFor(1)).toEqual([{'test': 'test'}]);
    });

    it('compileScript', function() {
      var dirs, expd;
      // Empty directives, empty script
      dirs = {};
      isolateScope.script = '';
      expd = '#!/bin/bash\n';
      isolateScope.compileScript(dirs);
      expect(isolateScope.directives).toEqual('#!/bin/bash\n');
      expect(isolateScope.sbatchScript).toEqual(expd);
      // Empty directives, script
      dirs = {};
      isolateScope.script = 'test script\n';
      expd = '#!/bin/bash\ntest script\n';
      isolateScope.compileScript(dirs);
      expect(isolateScope.directives).toEqual('#!/bin/bash\n');
      expect(isolateScope.sbatchScript).toEqual(expd);
      // Single directive, script
      dirs = {'test':'test'};
      isolateScope.script = 'test script\n';
      expd = '#!/bin/bash\n#SBATCH --test=test\ntest script\n';
      isolateScope.compileScript(dirs);
      expect(isolateScope.directives).toEqual('#!/bin/bash\n#SBATCH --test=test\n');
      expect(isolateScope.sbatchScript).toEqual(expd);
      // Multiple directives, script
      dirs = {
        'testStr':'test',
        'testEmpty': '',
        'testBool': true,
        'testFalse': false,
        'testNumber': 4,
        'testUndef': undefined
      };
      isolateScope.script = 'test script\n';
      expd = '#!/bin/bash\n';
      expd += '#SBATCH --testStr=test\n';
      expd += '#SBATCH --testBool\n';
      expd += '#SBATCH --testNumber=4\n';
      isolateScope.compileScript(dirs);
      expect(isolateScope.directives).toEqual(expd);
      expd += 'test script\n';
      expect(isolateScope.sbatchScript).toEqual(expd);
    });
  });

  describe('directive', function() {
    var $compile, $scope, isolateScope, element;

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.sbatch = {};
      $scope.script = 'test script\n';
      $scope.sbatchScript = '';
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('updates $scope.sbatchScript when sbatch or script values change', function() {
      var expd = '#!/bin/bash\n# Add your script below\n# ex: "srun echo $(hostname)"\n';
      $scope.$digest();
      expect($scope.sbatchScript).toEqual(expd);
      // Vary script value
      $scope.script = 'altered test script\n';
      $scope.$digest();
      expd = '#!/bin/bash\naltered test script\n';
      expect($scope.sbatchScript).toEqual(expd);
      // Vary sbatch
      $scope.sbatch = {'test':'test'};
      $scope.$digest();
      expd = '#!/bin/bash\n#SBATCH --test=test\naltered test script\n';
      expect($scope.sbatchScript).toEqual(expd);
    });
  });
});
