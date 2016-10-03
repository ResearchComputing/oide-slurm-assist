describe('sandstone.slurm.sa-duration', function() {
  var baseElement = '<input sa-duration min-duration="minDuration" max-duration="maxDuration" ng-model="model" ng-pattern="pattern" ng-readonly="readonly" ng-required="true">';

  beforeEach(module('sandstone'));
  beforeEach(module('sandstone.templates'));
  beforeEach(module('sandstone.slurm'));

  describe('directive', function() {
    var $compile, $scope, isolateScope, element;

    var setValue = function(v) {
      $scope.model = '';
      $scope.$digest();
      $scope.model = v;
      $scope.$digest();
    };

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      var el = angular.element(baseElement);
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.minDuration = 1;
      $scope.maxDuration = 1500;
      element = $compile(el)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('correctly validates the inputted duration', function() {
      var el, tpl;
      el = element[0];
      // No min
      $scope.minDuration = undefined;
      setValue('00:00:00');
      tpl = el.outerHTML;
      expect(tpl).not.toContain('ng-invalid-sa-duration');
      // No max
      $scope.minDuration = 1;
      $scope.maxDuration = undefined;
      setValue('00:01:00');
      tpl = el.outerHTML;
      expect(tpl).not.toContain('ng-invalid-sa-duration');
      // Min + Max
      $scope.minDuration = 1;
      $scope.maxDuration = 4;
      setValue('00:00:00');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      setValue('00:05:00');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      // MM
      $scope.minDuration = 1;
      $scope.maxDuration = 4;
      // valid
      setValue('01');
      tpl = el.outerHTML;
      expect(tpl).not.toContain('ng-invalid-sa-duration');
      // invalid
      setValue('0');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      setValue('05');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      // MM:SS
      $scope.minDuration = 1;
      $scope.maxDuration = 4;
      // valid
      setValue('01:30');
      tpl = el.outerHTML;
      expect(tpl).not.toContain('ng-invalid-sa-duration');
      // invalid min
      setValue('0:0');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      setValue('00:59');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      // invalid max
      setValue('03:121');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      setValue('05:00');
      tpl = el.outerHTML;
      expect(tpl).toContain('ng-invalid-sa-duration');
      // HH:MM:SS

      // DD-HH:MM:SS

    });
  });
});
