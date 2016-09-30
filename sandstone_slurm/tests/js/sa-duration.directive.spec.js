describe('sandstone.slurm.sa-duration', function() {
  var baseElement = '<input sa-duration min-duration="minDuration" max-duration="maxDuration" ng-model="model" ng-pattern="pattern" ng-readonly="readonly" ng-required="true">';

  beforeEach(module('sandstone'));
  beforeEach(module('sandstone.templates'));
  beforeEach(module('sandstone.slurm'));

  describe('directive', function() {
    var $compile, $scope, isolateScope, element;

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.minDuration = 1;
      $scope.maxDuration = 1500;
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('updates min and max duration values when altered on $scope', function() {
      // Alter max

      // Alter min

    });

    it('correctly validates the inputted duration', function() {
      // No max

      // No min

      // MM

      // MM:SS

      // HH:MM:SS

      // DD-HH:MM:SS

    });
  });
});
