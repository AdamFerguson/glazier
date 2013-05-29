var PROJECT_NAME = 'Glazier';
var proxy = require('proxy-middleware');
var url= require('url');
var CLOUDFRONT_HOST = "http://d4h95iioxf8ji.cloudfront.net";
var request = require('http').request;

function proxyIndex(req, res, next){
  if (req.url === "/" || req.url === "/index.html") {

    // TODO: don't hardcode configuration
    var opts = {
      pathname: 'index.html',
      hostname: '0.0.0.0',
      port: '3040'
    };

    var proxyReq =  request(opts, function (proxyRes) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.on('error', next);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', next);

    if (!req.readable) {
      proxyReq.end();
    } else {
      req.pipe(proxyReq);
    }

  } else {
    next();
  }
}

function middleware(connect, options) {
  var theUrl;

  theUrl = url.parse('http://localhost:3040/api');
  theUrl.route = '/api';

  return [
    proxy(theUrl),
    proxyIndex,
    connect['static'](options.base),
    connect.directory(options.base)
  ];
}

module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: 'localhost',
          base: 'tmp/public',
          middleware: middleware
        }
      }
    },

    watch: {

      files: ['app/**', 'cards/**', 'vendor/**', 'test/**'],
      tasks: ['build', 'jshint', 'qunit:all']
    },

    transpile: {
      main: {
        type: "amd",
        moduleName: function(defaultModuleName){
          return 'glazier/' + defaultModuleName;
        },
        files: [{
          expand: true,
          cwd: 'app/',
          src: ['**/*.js'],
          dest: 'tmp/public/glazier'
        }]
      },

      tests: {
        type: "amd",
        files: [{
          expand: true,
          cwd: 'test/',
          src: ['**/*.js', '!fixtures/**'],
          dest: 'tmp/public/test/'
        }]
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'public/',
            src: ['**'],
            dest: 'tmp/public/'
          }
        ]
      },

      test: {
        files: [
          {
            expand: true,
            cwd: 'test/',
            src: ['index.html'],
            dest: 'tmp/public/test'
        }
      ]},

      fixtures: {
        files: [
          {
            expand: true,
            cwd: 'test/',
            src: ['fixtures/**'],
            dest: 'tmp/public/test'
        }
      ]},

      cards: {
        files: [
          {
            expand: true,
              cwd: 'cards',
            src: ['**'],
            dest: 'tmp/public/cards'
          }
        ]
      },

      vendor: {
        files: [
          {
            expand: true,
              cwd: 'vendor',
            src: ['**'],
            dest: 'tmp/public/vendor'
          }
        ]
      }
    },

    qunit: {
      all:  {
        options: {
          urls: ['http://localhost:8000/test/index.html']
        }
      }
    },

    ember_handlebars: {
      compile: {
        options: {
          processName: function(filename) {
            return filename.replace(/templates\//,'').replace(/\.handlebars$/,'');
          }
        },
        files: {
          "tmp/public/glazier/templates.js": "templates/*.handlebars"
        }
      }
    },

    concat: {
      main: {
        src: ['tmp/public/glazier/**/*.js'],
        dest: 'tmp/public/glazier.js'
      },
      tests: {
        src: ['tmp/public/test/**/*.js', '!tmp/public/test/fixtures/**'],
        dest: 'tmp/public/test.js'
      }
    },

    shell: {
      ingest: {
        command: [
          "cd glazier-server",
          "bundle exec rake 'glazier:ingest_as_current[../tmp/public/index.html]'"
        ].join(' && '),
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    },

    s3: {
      options: {
        key: '<%= env.GLAZIER_S3_KEY %>',
        secret: '<%= env.GLAZIER_S3_SECRET %>',
        bucket: 'glazier',
        gzip: true,
        access: 'public-read'
      },
      dev: {
        upload: [
          {
            src: 'tmp/md5/glazier*.js',
            dest: 'assets/'
          },
          {
            src: 'tmp/md5/vendor/**/*-*.js',
            dest: 'assets/vendor/'
          }
        ]
      }
    },

    jshint: {
      all: {
        // TODO: Run jshint on individual files when jshint supports ES6 modules
        src: ['Gruntfile.js', 'tmp/public/glazier.js', 'tmp/public/test.js'],
        options: {
          predef: [
            "Ember",
            "Conductor",
            "$",
            "define",
            "console",
            "require",
            "requireModule",
            "equal",
            "notEqual",
            "notStrictEqual",
            "test",
            "asyncTest",
            "testBoth",
            "testWithDefault",
            "raises",
            "throws",
            "deepEqual",
            "start",
            "stop",
            "ok",
            "strictEqual",
            "module",
            "process",
            "expect"
          ],
          "node" : false,
          "browser" : true,
          "boss" : true,
          "curly": false,
          "debug": false,
          "devel": false,
          "eqeqeq": true,
          "evil": true,
          "forin": false,
          "immed": false,
          "laxbreak": false,
          "newcap": true,
          "noarg": true,
          "noempty": false,
          "nonew": false,
          "nomen": false,
          "onevar": false,
          "plusplus": false,
          "regexp": false,
          "undef": true,
          "sub": true,
          "strict": false,
          "white": false,
          "eqnull": true
        }
      }
    },

    clean: ["tmp"],

    md5: {
      compile: {
        files: [{
          expand: true,
          cwd: 'tmp/public',
          src: ['**/*'],
          dest: 'tmp/md5/',
          filter: 'isFile'
        }],
        options: {
          cmd: 'tmp/public/glazier',
          encoding: null,
          keepBasename: true,
          keepExtension: true,
          after: function (fileChanges, options) {
            var manifest, key, file, from, to;

            manifest = {};

            for (key in fileChanges) {
              file = fileChanges[key];

              from = file.oldPath.replace(/^tmp\/public/,'');
              to = file.newPath.replace(/^tmp\/md5/,'/assets');

              manifest[from] = to;
            }

            grunt.file.write('tmp/manifest.json', JSON.stringify(manifest));
          }
        }
      }
    },

    uglify: {
      all: {
        files: [
          {
            expand: true,
            cwd: 'tmp/public/',
            src: ['glazier.js'],
            ext: '.min.js',
            dest: 'tmp/public/'
          },
          {
            expand: true,
            cwd: 'tmp/public/vendor/',
            src: '**/*.js',
            ext: '.min.js',
            dest: 'tmp/public/vendor/'
          }
        ]
      }
    }
  });

  grunt.registerTask('index.html', 'process index.html', function() {
    var template = grunt.file.read('public/index.html');
    var manifestContents;
    var manifest;

    if (process.env.GLAZIER_ENV === "prod") {
      manifest = grunt.file.readJSON('tmp/manifest.json');
    }

    var indexContents = grunt.template.process(template, {
      data: {
        manifestUrl: function(path) {
          if(process.env.GLAZIER_ENV === "prod") {
            path = path.replace(/\.js$/, '.min.js');
            /* Our MD5 task adds the -MD5 directly before the .js */
            return CLOUDFRONT_HOST + manifest[path]; //.replace(/(-[^-]+)\.js$/, '$1.js');
          } else {
            return path;
          }
        }
      }
    });

    grunt.file.write("tmp/public/index.html", indexContents);
  });

  grunt.registerTask("prod", function(){
    process.env.GLAZIER_ENV = 'prod';
  });

  grunt.registerTask('build', ['clean', 'ember_handlebars', 'transpile', 'copy', 'concat']);

  grunt.registerTask('assets', ['build', 'jshint', 'uglify:all', 'md5', 'index.html']);

  grunt.registerTask('ingest', ['assets', 'shell:ingest']);
  grunt.registerTask('deploy', ['assets', 's3:dev']);

  grunt.registerTask('preview', ['build',  'jshint', 'uglify:all', 'md5', 'index.html', 'shell:ingest', 'connect', 'watch']);
  grunt.registerTask('preview:cdn', ['prod', 'deploy', 'shell:ingest', 'connect', 'watch']);

  grunt.registerTask('test', ['build',  'connect', 'qunit:all']);
  grunt.registerTask('default', ['build', 'index.html', 'connect', 'watch']);

};
