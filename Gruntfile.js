module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  function config(configFileName) {
    return require('./configurations/' + configFileName);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    connect: config('connect'),
    watch: config('watch'),
    transpile: config('transpile'),
    copy: config('copy'),
    qunit: config('qunit'),
    ember_handlebars: config('ember_handlebars'),
    concat: config('concat'),
    shell: config('shell'),
    s3: config('s3'),
    jshint: config('jshint'),
    clean: ["tmp"],
    md5: config('md5'),
    uglify: config('uglify')
  });

  grunt.loadTasks('tasks');

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
