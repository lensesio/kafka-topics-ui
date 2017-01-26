//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: '',

    files: [
                'env.js',
                'bower_components/angular/angular.min.js',
                'bower_components/angular-mocks/angular-mocks.js',
                'bower_components/bootstrap/dist/css/bootstrap.min.css',
                'bower_components/angular-route/angular-route.min.js',
                'bower_components/angular-animate/angular-animate.min.js',
                'bower_components/angular-aria/angular-aria.min.js',
                'bower_components/angular-material/angular-material.min.js',
                'bower_components/ace-builds/src-min-noconflict/ace.js',
                'bower_components/ace-builds/src-min-noconflict/ext*.js',
                'bower_components/ace-builds/src-min-noconflict/mode-json.js',
                'bower_components/ace-builds/src-min-noconflict/mode-batchfile.js',
                'bower_components/ace-builds/src-min-noconflict/theme-chrome.js',
                'bower_components/ace-builds/src-min-noconflict/worker-json.js',
                'bower_components/angular-ui-ace/ui-ace.min.js',
                'bower_components/spin.js/spin.min.js',
                'bower_components/angular-ui-grid/ui-grid.min.js',
                'bower_components/angular-spinner/angular-spinner.min.js',
                'bower_components/angular-material-data-table/dist/md-data-table.min.js',
                'bower_components/angular-base64/angular-base64.min.js',
                'bower_components/oboe/dist/oboe-browser.min.js',
                'bower_components/angular-oboe/dist/angular-oboe.min.js',
                'bower_components/angular-json-tree/dist/angular-json-tree.min.js',
       'src/*.js', 'src/factories/*.js', 'src/kafka-topics/**/*.controller.js',
      'src/**/*.spec.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    reporters: ["spec"],
          specReporter: {
            maxLogLines: 5,         // limit number of lines logged per test
            suppressErrorSummary: true,  // do not print error summary
            suppressFailed: false,  // do not print information about failed tests
            suppressPassed: false,  // do not print information about passed tests
            suppressSkipped: true,  // do not print information about skipped tests
            showSpecTiming: false // print the time elapsed for each spec
          },

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-spec-reporter',
      'karma-junit-reporter',
      'karma-phantomjs-launcher' //tODO
    ],

    junitReporter: {
        outputFile: 'test_out/unit.xml',
        suite: 'unit'
    }

  });
};
