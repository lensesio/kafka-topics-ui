'use strict';
//https://nathanleclaire.com/blog/2013/12/13/how-to-unit-test-controllers-in-angularjs-without-setting-your-hair-on-fire/
//http://stackoverflow.com/questions/16565531/unit-testing-angularjs-factories-that-have-dependencies
describe('HeaderCtrl', function() {

  beforeEach(module('angularAPP'));

  it('shoud find 3 in test scope var', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('HeaderCtrl', {$scope: scope});
    expect(scope.test).toBe(3);
  }));

  it('should return 4 on 3 sum()', inject(function($controller) {
      var scope = {};
      var ctrl = $controller('HeaderCtrl', {$scope: scope});
      expect(scope.sum(3)).toBe(4);
  }));
//
//    it('xxxx', inject(function($controller, $rootScope) {
//        var rootScope = {};
//        var ctrl = $controller('HeaderCtrl', {});
//        expect(rootScope.showLeftList()).toBe(true);
//    }));

});


//(function() {
//  describe('envFactory Spec', function() {
//
//    var envFactory;
//
//    beforeEach(function() {
//      angular.module('angularAPP');
//    });
//
////    beforeEach(inject(function() {
////      var $injector = angular.injector(['angularAPP']);
////      envFactory = $injector.get('env');
////    }));
//
//     var factory = null;
//        beforeEach(inject(function(env) {
//          factory = env;
//        }));
//
//    it('is very true', function(){
//      var output = factory.getClusters();
//      expect(output.length).toBe(2);
//    });
//
//  });
//}());


describe('app: myApp', function() {

  beforeEach(module('angularAPP'));

//   var $rootScope, scope;
//
//    beforeEach(inject(function(_$rootScope_) {
//       $rootScope = _$rootScope_;
//     }));
//
//     scope = $rootScope.$new();

  // Factory of interest is called MyFactory
  describe('factory: MyFactory', function() {

    var factory = null;
    var factory2 = null;
    var factory3 = null;

    beforeEach(inject(function(MyFactory, KafkaRestProxyFactory) {
      factory = MyFactory;
      factory2 = KafkaRestProxyFactory;
    }))

    it('Should define methods', function() {
      expect(factory.beAwesome).toBeDefined()
      expect(factory.beAwesome).toEqual(jasmine.any(Function))
      expect(factory2.consumeKafkaRest).toBeDefined()
//      expect(factory3.clusterArray).toBeDefined()
    });



  });

});

angularAPP.factory('MyFactory', function() {
  var factory = {};
  factory.beAwesome = function() {
    return 'Awesome!';
  }
  return factory;
});