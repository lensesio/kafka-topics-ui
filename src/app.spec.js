'use strict';

angularAPP.controller('SomeCtrl', function (env, $rootScope, $scope, $log, $location, $route) {

    $scope.test = 3;

    $scope.sum = function(a) {
        return a+1;
    }

  $scope.$on('$routeChangeSuccess', function() {
     $rootScope.clusters = env.getClusters();
     $rootScope.cluster = env.getSelectedCluster();
     $scope.color = $scope.cluster.COLOR;
  });

  $scope.updateEndPoint = function(cluster) {
    $rootScope.connectionFailure = false;
    $location.path("/cluster/"+cluster)
    $rootScope.cluster = cluster;
  }

   $rootScope.showList = true;
   $rootScope.toggleList = function () {
      $rootScope.showList = !$rootScope.showList;
   };

   $rootScope.showLeftList = function () {
      $rootScope.showList = true;
   };


});




//https://nathanleclaire.com/blog/2013/12/13/how-to-unit-test-controllers-in-angularjs-without-setting-your-hair-on-fire/
//http://stackoverflow.com/questions/16565531/unit-testing-angularjs-factories-that-have-dependencies
describe('HeaderCtrl', function() {

  beforeEach(module('angularAPP'));

  var scope, controller;
  beforeEach(inject(function ($controller, $rootScope) {
      // The injector unwraps the underscores (_) from around the parameter names when matching
      scope =  $rootScope.$new();
      controller = $controller('SomeCtrl', {$scope: scope});
  }));


  it('shoud find 3 in test scope var', inject(function($controller) {
    expect(scope.test).toBe(3);
  }));

  it('should return 4 on 3 sum()', inject(function($controller) {
//      var scope = {};
//      var ctrl = $controller('HeaderCtrl', {$scope: scope});
      expect(scope.sum(3)).toBe(4);
  }));
//
    it('xxxx', inject(function($controller, $rootScope) {
//        var rootScope = {};
//        var ctrl = $controller('HeaderCtrl', {});
        expect(scope.showList).toBe(true);
        expect(scope.showLeftList).toBeDefined;
    }));

    it('yyy', inject(function($controller, $rootScope) {
        expect(scope.toggleList).toBeDefined;
        scope.toggleList();
        expect(scope.showList).toBe(false);
    }));

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