// Generated on 2014-07-04 using generator-angular 0.9.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
var buildClientBundle = require('./client/lbclient/build');

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bowerWebsite: {
        files: ['bower.json'],
        tasks: ['wiredep:website']
      },
      jsWebsite: {
        files: ['website/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:website'],
        options: {
          livereload: {
            port: 35729
          }
        }
      },
      jsTestWebsite: {
        files: ['website/test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:website', 'karma:website']
      },
      compassWebsite: {
        files: ['website/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:website', 'autoprefixer:website']
      },
      bowerChat: {
        files: ['bower.json'],
        tasks: ['wiredep:chat']
      },
      jsChat: {
        files: ['chat/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:chat'],
        options: {
          livereload: {
            port: 35729
          }
        }
      },
      jsTestChat: {
        files: ['chat/test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:chat', 'karma:chat']
      },
      compassChat: {
        files: ['chat/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:chat', 'autoprefixer:chat']
      },
      bowerWidget: {
        files: ['bower.json'],
        tasks: ['wiredep:widget', 'wiredep:widgetLogin']
      },
      jsWidget: {
        files: ['widget/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:widget'],
        options: {
          livereload: {
            port: 35729
          }
        }
      },
      jsTestWidget: {
        files: ['widget/test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:widget', 'karma:widget']
      },
      compassWidget: {
        files: ['widget/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:widget', 'autoprefixer:widget']
      },
      lbclient: {
        files: [
          'lbclient/models/*',
          'lbclient/app*',
          'lbclient/datasources*',
          'lbclient/models*',
          'lbclient/build.js'
        ],
        tasks: ['build-lbclient'],
        options: {
          livereload: {
            port: 35729
          }
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      server: {
        files: ['server/{,*/}*.{js,json}', 'common/{,*/}*.{js,json}'],
        tasks: [
          'loopback_sdk_angular',
          //'docular'
        ]
      },
      livereload: {
        options: {
          livereload: {
            port: 35729
          }
        },
        files: [
          'website/{,*/}*.html',
          'website/.tmp/styles/{,*/}*.css',
          'website/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'chat/{,*/}*.html',
          'chat/.tmp/styles/{,*/}*.css',
          'chat/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'widget/{,*/}*.html',
          'widget/.tmp/styles/{,*/}*.css',
          'widget/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'lbclient/browser.bundle.js'
        ]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      website: {
        src: [
          'Gruntfile.js',
          'website/scripts/{,*/}*.js'
        ]
      },
      chat: {
        src: [
          'chat/scripts/{,*/}*.js'
        ]
      },
      widget: {
        src: [
          'widget/scripts/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'website/.tmp',
            'client/website/{,*/}*',
            '!client/website/.git*',
            'chat/.tmp',
            'client/chat/{,*/}*',
            '!client/chat/.git*',
            'widget/.tmp',
            'client/widget/{,*/}*',
            '!client/widget/.git*',
            'lbclient/browser.bundle.js'
          ]
        }]
      },
      server: ['website/.tmp', 'chat/.tmp', 'widget/.tmp']
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      website: {
        files: [{
          expand: true,
          cwd: 'website/.tmp/styles/',
          src: '{,*/}*.css',
          dest: 'website/.tmp/styles/'
        }]
      },
      chat: {
        files: [{
          expand: true,
          cwd: 'chat/.tmp/styles/',
          src: '{,*/}*.css',
          dest: 'chat/.tmp/styles/'
        }]
      },
      widget: {
        files: [{
          expand: true,
          cwd: 'widget/.tmp/styles/',
          src: '{,*/}*.css',
          dest: 'widget/.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      options: {
        cwd: '.'
      },
      website: {
        src: ['website/index.html'],
        ignorePath:  /\.\.\//,
        fileTypes: {
          html: {
            replace: {
              js: '<script src="/{{filePath}}"></script>',
              css: '<link rel="stylesheet" href="/{{filePath}}" />'
            }
          }
        },
        exclude: [
          '/bower_components/es5-shim/es5-shim.js',
          '/bower_components/json3/lib/json3.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
          '/bower_components/angular-route/angular-route.js',
          '/bower_components/angulartics/src/angulartics-adobe.js',
          '/bower_components/angulartics/src/angulartics-chartbeat.js',
          '/bower_components/angulartics/src/angulartics-flurry.js',
          '/bower_components/angulartics/src/angulartics-ga-cordova.js',
          '/bower_components/angulartics/src/angulartics-gtm.js',
          '/bower_components/angulartics/src/angulartics-kissmetrics.js',
          '/bower_components/angulartics/src/angulartics-mixpanel.js',
          '/bower_components/angulartics/src/angulartics-piwik.js',
          '/bower_components/angulartics/src/angulartics-scroll.js',
          '/bower_components/angulartics/src/angulartics-segmentio.js',
          '/bower_components/angulartics/src/angulartics-splunk.js',
          '/bower_components/angulartics/src/angulartics-woopra.js',
          '/bower_components/angulartics/src/angulartics-cnzz.js',
          '/bower_components/angulartics/src/angulartics-marketo.js',
          '/bower_components/angulartics/src/angulartics-intercom.js',
          '/bower_components/jquery-waypoints/waypoints.js'
        ],
      },
      sassWebsite: {
        src: ['website/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      },
      chat: {
        src: ['chat/index.html'],
        ignorePath:  /\.\.\//,
        fileTypes: {
          html: {
            replace: {
              js: '<script src="/{{filePath}}"></script>',
              css: '<link rel="stylesheet" href="/{{filePath}}" />'
            }
          }
        },
        exclude: [
          'bower_components/es5-shim/es5-shim.js',
          'bower_components/json3/lib/json3.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
          '/bower_components/angular-route/angular-route.js',
          'bower_components/angulartics/src/angulartics-adobe.js',
          'bower_components/angulartics/src/angulartics-chartbeat.js',
          'bower_components/angulartics/src/angulartics-flurry.js',
          'bower_components/angulartics/src/angulartics-ga-cordova.js',
          'bower_components/angulartics/src/angulartics-gtm.js',
          'bower_components/angulartics/src/angulartics-kissmetrics.js',
          'bower_components/angulartics/src/angulartics-mixpanel.js',
          'bower_components/angulartics/src/angulartics-piwik.js',
          'bower_components/angulartics/src/angulartics-scroll.js',
          'bower_components/angulartics/src/angulartics-segmentio.js',
          'bower_components/angulartics/src/angulartics-splunk.js',
          'bower_components/angulartics/src/angulartics-woopra.js',
          '/bower_components/angulartics/src/angulartics-cnzz.js',
          '/bower_components/angulartics/src/angulartics-marketo.js',
          '/bower_components/angulartics/src/angulartics-intercom.js',
          'bower_components/jquery-waypoints/waypoints.js',
          'bower_components/moment/moment.js',
          'bower_components/requirejs/require.js'
        ],
      },
      sassChat: {
        src: ['chat/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      },
      widget: {
        src: ['widget/index.html'],
        ignorePath:  /\.\.\//,
        fileTypes: {
          html: {
            replace: {
              js: '<script src="/{{filePath}}"></script>',
              css: '<link rel="stylesheet" href="/{{filePath}}" />'
            }
          }
        },
        exclude: [
          '/bower_components/es5-shim/es5-shim.js',
          '/bower_components/json3/lib/json3.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
          '/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
          '/bower_components/angular-ui-router/release/angular-ui-router.js',
          '/bower_components/angulartics/src/angulartics-adobe.js',
          '/bower_components/angulartics/src/angulartics-chartbeat.js',
          '/bower_components/angulartics/src/angulartics-flurry.js',
          '/bower_components/angulartics/src/angulartics-ga-cordova.js',
          '/bower_components/angulartics/src/angulartics-ga.js',
          '/bower_components/angulartics/src/angulartics-kissmetrics.js',
          '/bower_components/angulartics/src/angulartics-mixpanel.js',
          '/bower_components/angulartics/src/angulartics-piwik.js',
          '/bower_components/angulartics/src/angulartics-scroll.js',
          '/bower_components/angulartics/src/angulartics-segmentio.js',
          '/bower_components/angulartics/src/angulartics-splunk.js',
          '/bower_components/angulartics/src/angulartics-woopra.js',
          '/bower_components/angulartics/src/angulartics-cnzz.js',
          '/bower_components/angulartics/src/angulartics-marketo.js',
          '/bower_components/angulartics/src/angulartics-intercom.js',
          '/bower_components/jquery-waypoints/waypoints.js'
        ],
      },
      widgetLogin: {
        src: ['widget/auth/index.html'],
        ignorePath:  /\.\.\//,
        fileTypes: {
          html: {
            replace: {
              js: '<script src="/{{filePath}}"></script>',
              css: '<link rel="stylesheet" href="/{{filePath}}" />'
            }
          }
        },
        exclude: [
          'bower_components/es5-shim/es5-shim.js',
          'bower_components/json3/lib/json3.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
          '/bower_components/angular-route/angular-route.js',
          'bower_components/angulartics/src/angulartics-adobe.js',
          'bower_components/angulartics/src/angulartics-chartbeat.js',
          'bower_components/angulartics/src/angulartics-flurry.js',
          'bower_components/angulartics/src/angulartics-ga-cordova.js',
          'bower_components/angulartics/src/angulartics-gtm.js',
          'bower_components/angulartics/src/angulartics-kissmetrics.js',
          'bower_components/angulartics/src/angulartics-mixpanel.js',
          'bower_components/angulartics/src/angulartics-piwik.js',
          'bower_components/angulartics/src/angulartics-scroll.js',
          'bower_components/angulartics/src/angulartics-segmentio.js',
          'bower_components/angulartics/src/angulartics-splunk.js',
          'bower_components/angulartics/src/angulartics-woopra.js',
          '/bower_components/angulartics/src/angulartics-cnzz.js',
          '/bower_components/angulartics/src/angulartics-marketo.js',
          '/bower_components/angulartics/src/angulartics-intercom.js',
          'bower_components/jquery-waypoints/waypoints.js',
          'bower_components/moment/moment.js',
          'bower_components/requirejs/require.js'
        ],
      },
      sassWidget: {
        src: ['widget/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      website: {
        options: {
          sassDir: 'website/styles',
          cssDir: 'website/.tmp/styles',
          generatedImagesDir: 'website/.tmp/images/generated',
          imagesDir: 'website/images',
          javascriptsDir: 'website/scripts',
          fontsDir: 'website/styles/fonts',
          importPath: './bower_components',
          httpImagesPath: 'website/images',
          httpGeneratedImagesPath: 'website/images/generated',
          httpFontsPath: 'website/styles/fonts',
          relativeAssets: false,
          assetCacheBuster: false,
          raw: 'Sass::Script::Number.precision = 10\n'
        }
      },
      chat: {
        options: {
          sassDir: 'chat/styles',
          cssDir: 'chat/.tmp/styles',
          generatedImagesDir: 'chat/.tmp/images/generated',
          imagesDir: 'chat/images',
          javascriptsDir: 'chat/scripts',
          fontsDir: 'chat/styles/fonts',
          importPath: './bower_components',
          httpImagesPath: 'chat/images',
          httpGeneratedImagesPath: 'chat/images/generated',
          httpFontsPath: 'chat/styles/fonts',
          relativeAssets: false,
          assetCacheBuster: false,
          raw: 'Sass::Script::Number.precision = 10\n'
        }
      },
      widget: {
        options: {
          sassDir: 'widget/styles',
          cssDir: 'widget/.tmp/styles',
          generatedImagesDir: 'widget/.tmp/images/generated',
          imagesDir: 'widget/images',
          javascriptsDir: 'widget/scripts',
          fontsDir: 'widget/styles/fonts',
          importPath: './bower_components',
          httpImagesPath: 'widget/images',
          httpGeneratedImagesPath: 'widget/images/generated',
          httpFontsPath: 'widget/styles/fonts',
          relativeAssets: false,
          assetCacheBuster: false,
          raw: 'Sass::Script::Number.precision = 10\n'
        }
      },
      dist: {
        options: {
          generatedImagesDir: 'client/website/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    loopback_sdk_angular: {
      services: {
        options: {
          input: 'server/server.js',
          output: 'client/lb-services.js',
          apiUrl: '/api'
        }
      }
    },
    docular: {
      groups: [
        {
          groupTitle: 'LoopBack',
          groupId: 'loopback',
          sections: [
            {
              id: 'lbServices',
              title: 'LoopBack Services',
              scripts: [ 'client/lb-services.js' ]
            }
          ]
        }
      ]
    },

    // Renames files for browser caching purposes
    filerev: {
      website: {
        src: [
          'client/website/scripts/{,*/}*.js',
          'client/website/styles/{,*/}*.css',
          'client/website/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'client/website/styles/fonts/*'
        ]
      },
      chat: {
        src: [
          'client/chat/scripts/{,*/}*.js',
          'client/chat/styles/{,*/}*.css',
          'client/chat/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'client/chat/styles/fonts/*'
        ]
      },
      widget: {
        src: [
          'client/widget/scripts/{,*/}*.js',
          'client/widget/styles/{,*/}*.css',
          'client/widget/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'client/widget/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      website: {
        options: {
          dest: 'client/website'
        },
        src: ['website/index.html'],
      },
      chat: {
        options: {
          dest: 'client/chat'
        },
        src: ['chat/index.html'],
      },
      widget: {
        options: {
          dest: 'client/widget'
        },
        src: ['widget/index.html'],
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      'website-html': {
        options: {
          assetsDirs: ['client/website','client/website/images'],
          type:'html'
        },
        files: { src: ['client/website/{,*/}*.html'] }
      },
      'website-css': {
        options: {
          assetsDirs: ['client/website','client/website/images'],
          type:'css'
        },
        files: { src: ['client/website/styles/{,*/}*.css'] }
      },
      'chat-html': {
        options: {
          assetsDirs: ['client/chat','client/chat/images'],
          type:'html'
        },
        files: { src: ['client/chat/{,*/}*.html'] }
      },
      'chat-css': {
        options: {
          assetsDirs: ['client/chat','client/chat/images'],
          type:'css'
        },
        files: { src: ['client/chat/styles/{,*/}*.css'] }
      },
      'widget-html': {
        options: {
          assetsDirs: ['client/widget','client/widget/images'],
          type:'html'
        },
        files: { src: ['client/widget/{,*/}*.html'] }
      },
      'widget-css': {
        options: {
          assetsDirs: ['client/widget','client/widget/images'],
          type:'css'
        },
        files: { src: ['client/widget/styles/{,*/}*.css'] }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'website/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: 'client/website/images'
        },{
          expand: true,
          cwd: 'chat/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: 'client/chat/images'
        },{
          expand: true,
          cwd: 'widget/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: 'client/widget/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'website/images',
          src: '{,*/}*.svg',
          dest: 'client/website/images'
        },{
          expand: true,
          cwd: 'chat/images',
          src: '{,*/}*.svg',
          dest: 'client/chat/images'
        },{
          expand: true,
          cwd: 'widget/images',
          src: '{,*/}*.svg',
          dest: 'client/widget/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: 'client/website',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: 'client/website'
        },{
          expand: true,
          cwd: 'client/chat',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: 'client/chat'
        },{
          expand: true,
          cwd: 'client/widget',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: 'client/widget'
        }]
      }
    },

    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    i18nextract: {
      website: {
        src: [ 'website/scripts/**/*.js', 'website/**/*.html' ],
        lang: ['en'],
        dest: 'website/locales'
      },
      chat: {
        src: [ 'chat/scripts/**/*.js', 'chat/**/*.html' ],
        lang: ['en'],
        dest: 'chat/locales'
      },
      widget: {
        src: [ 'widget/scripts/**/*.js', 'widget/**/*.html' ],
        lang: ['en'],
        dest: 'widget/locales'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['client/website/*.html', 'client/chat/*.html', 'client/widget/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'website',
          dest: 'client/website',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: 'client/website/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'website/locales/',
          src: '**',
          dest: 'client/website/locales/'
        },{
          expand: true,
          dot: true,
          cwd: 'chat',
          dest: 'client/chat',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: 'client/chat/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'chat/locales/',
          src: '**',
          dest: 'client/chat/locales/'
        },{
          expand: true,
          dot: true,
          cwd: 'widget',
          dest: 'client/widget',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: 'client/widget/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'widget/locales/',
          src: '**',
          dest: 'client/widget/locales/'
        }]
      },
      styles: {
        expand: true,
        cwd: 'website/styles',
        dest: 'website/.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      nodemon_dev: {
        options: {
          logConcurrentOutput: true,
        },
        tasks: [
          //'compass',
          'nodemon:dev',
          'watch'
        ]
      },
      nodemon_prod: {
        options: {
          logConcurrentOutput: true,
        },
        tasks: [
          'nodemon:prod',
          'watch'
        ]
      },
      server: [
        'compass:server'
      ],
      dist: [
        'compass',
        'imagemin',
        'svgmin'
      ],
      test: [
        'compass'
      ]
    },

    nodemon: {
      dev: {
        script: 'server/server.js',
        options: {
          args: ['development'],
          watch: ['server', 'common'],
          ignore: ['node_modules/**'],
          debug: false,
          delayTime: 1,
          env: {
            NODE_ENV: 'development',
            PORT: 3000,
            PORT_SSL: 4000
          },
          cwd: __dirname
        }
      },
      prod: {
        script: 'server/server.js',
        options: {
          args: ['production'],
          watch: ['server', 'common'],
          ignore: ['node_modules/**'],
          debug: false,
          delayTime: 1,
          env: {
            NODE_ENV: 'production',
            PORT: 3000,
            PORT_SSL: 4000
          },
          cwd: __dirname
        }
      }
    },

    // Test settings
    karma: {
      website: {
        configFile: 'website/test/karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('build-lbclient', 'Build lbclient browser bundle', function() {
    var done = this.async();
    buildClientBundle(process.env.NODE_ENV || 'development', done);
  });

  grunt.registerTask('buildClients', [
    'i18nextract',
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('dev', [
    //'loopback_sdk_angular',
    //'build-lbclient',
    'wiredep',
    'autoprefixer',
    'concurrent:nodemon_dev'
  ]);

  grunt.registerTask('prod', [
    //'build-lbclient',
    //'docular',
    'concurrent:nodemon_prod'
  ]);

  grunt.registerTask('test', [
    'testWebsite'
  ]);

  grunt.registerTask('build', [
    //'build-lbclient',
    'loopback_sdk_angular',
    'buildClients'
  ]);
};
