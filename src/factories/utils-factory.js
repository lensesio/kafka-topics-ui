/**
 * Utils angularJS Factory
 */
angularAPP.factory('UtilsFactory', function ($log) {

  /* Public API */
  return {

    sortByKey: function (array, key, reverse) {
      return sortByKey(array, key, reverse);
    },
    sortByVersion: function(array) {
      var sorted = array.sort(function(a, b) {
        return a.version - b.version;
      });
      return sorted;
    },
    IsJsonString: function (str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },
    flattenObject: function(ob) {
        return flattenObject(ob)
    }

  }

    // Sort arrays by key
    function sortByKey(array, key, reverse) {
      return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 * reverse : ((x > y) ? 1 * reverse : 0));
      });
    }

      function flattenObject(ob) {
          	var toReturn = {};

          	for (var i in ob) {
          		if (!ob.hasOwnProperty(i)) continue;

          		if ((typeof ob[i]) == 'object') {
          			var flatObject = flattenObject(ob[i]);

          			for (var x in flatObject) {
          				if (!flatObject.hasOwnProperty(x)) continue;
          				toReturn[i + '.' + x] = flatObject[x];
          			}

          		} else {
          			toReturn[i] = ob[i];
          		}
          	}
          	return toReturn;
          };

});