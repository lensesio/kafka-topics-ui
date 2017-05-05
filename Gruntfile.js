'use strict';

module.exports = function (grunt) {

  require('jit-grunt')(grunt, {});

  grunt.loadNpmTasks('grunt-cache-breaker');
  // Define the configuration
  grunt.initConfig({

    // Project settings
    bower: grunt.file.readJSON('bower.json'),

    clean: {
      src: ['dist']
    },

    copy: {
      files: {
        cwd: '.',
        src: [
          'index.html',
          'src/assets/**',
          'src/**/*.html',
          'src/*.html',
          'env.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular/angular.min.js.map',                 // Include source-maps
          'bower_components/angular-spinner/angular-spinner.min.js',
          'bower_components/angular-spinner/angular-spinner.min.js.map', // Include source-maps
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-route/angular-route.min.js.map',     // Include source-maps
          'bower_components/angular-animate/angular-animate.min.js',
          'bower_components/angular-animate/angular-animate.min.js.map', // Include source-maps
          'bower_components/angular-aria/angular-aria.min.js',
          'bower_components/angular-aria/angular-aria.min.js.map',       // Include source-maps
          'bower_components/angular-material/angular-material.min.css',
          'bower_components/font-awesome/css/font-awesome.min.css',
          'bower_components/font-awesome/fonts/**',
          'bower_components/ace-builds/src-min-noconflict/ace.js',
          'bower_components/ace-builds/src-min-noconflict/ext*.js',
          'bower_components/ace-builds/src-min-noconflict/mode-json.js',
          'bower_components/ace-builds/src-min-noconflict/mode-batchfile.js',
          'bower_components/ace-builds/src-min-noconflict/theme-chrome.js',
          'bower_components/ace-builds/src-min-noconflict/worker-json.js',
          'bower_components/angular-ui-ace/ui-ace.min.js',
          'bower_components/spin.js/spin.min.js',
          'bower_components/angular-material/angular-material.min.js',
          'bower_components/angular-cookies/angular-cookies.min.js',
          // 'bower_components/angularUtils-pagination/dirPagination.js',
          'bower_components/angular-material-data-table/dist/md-data-table.min.css',
          'bower_components/angular-material-data-table/dist/md-data-table.min.js',
          'bower_components/angular-json-tree/dist/angular-json-tree.min.js',
          'bower_components/angular-json-tree/dist/angular-json-tree.css',
          'bower_components/angular-google-chart/ng-google-chart.min.js',
          'bower_components/handsontable/dist/handsontable.full.js',
          'bower_components/ngHandsontable/dist/ngHandsontable.js',
          'bower_components/handsontable/dist/handsontable.full.css',
          'bower_components/angularjs-slider/dist/rzslider.min.js',
          'bower_components/angular-base64/angular-base64.js',
          'bower_components/angularjs-slider/dist/rzslider.css'

        ],
        dest: 'dist',
        expand: true
      }
    },

    concat: {
      dist: {
        src: ['src/*.js', 'src/factories/*.js', 'src/libs/**/*.js', 'src/kafka-topics/**/*.controller.js', 'src/kafka-topics/**/*.module.js'],
        dest: 'dist/combined.js'
      }
    },

  cachebreaker: {
      js: {
          options: {
              match: ['combined.js'],
              replacement: 'md5',
              src: {
                  path: 'dist/combined.js'
              }
          },
          files: {
              src: ['dist/index.html']
          }
      }
  },

    usemin: {
      html: ['dist/index.html']
    }

  });

  grunt.registerTask('default', [
    'clean',
    'copy',
    'concat',
    'usemin', 'cachebreaker'
  ]);
};
