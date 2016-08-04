'use strict';

module.exports = function (grunt) {

  require('jit-grunt')(grunt, {});

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
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/angular-material/angular-material.min.css',
          'bower_components/font-awesome/css/font-awesome.min.css',
          'bower_components/font-awesome/fonts/**',
          'bower_components/ace-builds/src-min-noconflict/ace.js',
          'bower_components/ace-builds/src-min-noconflict/ui-ace.min.js',
          'bower_components/ace-builds/src-min-noconflict/ext*.js',
          'bower_components/ace-builds/src-min-noconflict/mode-json.js',
          'bower_components/ace-builds/src-min-noconflict/mode-batchfile.js',
          'bower_components/ace-builds/src-min-noconflict/theme-chrome.js',
          'bower_components/ace-builds/src-min-noconflict/worker-json.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-ui-ace/ui-ace.min.js',
          'bower_components/spin.js/spin.min.js',
          'bower_components/angular-spinner/angular-spinner.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-material/angular-material.min.js',
          'bower_components/angularUtils-pagination/dirPagination.js',
          'bower_components/angular-animate/angular-animate.min.js',
          'bower_components/angular-aria/angular-aria.min.js'
        ],
        dest: 'dist',
        expand: true
      }
    },

    concat: {
      dist: {
        src: ['src/*.js', 'src/**/*-factory.js', 'src/**/*.controller.js'],
        dest: 'dist/combined.js'
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
    'usemin'
  ]);
};
