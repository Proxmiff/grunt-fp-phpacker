'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>',
			],
			options: {
				jshintrc: '.jshintrc',
			},
		},
		clean: {
			tests: ['tmp'],
		},
		phpacker: {
			default_options: {
				options: {},
				files: {
					'tmp/default.php': 'test/fixtures/**/*.php'
				},
			},
			multiline_banner: {
				options: {
					banner: [
						"PHP Script",
						"v. 1.0",
						"",
						"Multiline banner example"
					],
				},
				files: {
					'tmp/multiline.php': 'test/fixtures/**/*.php'
				},
			},
			custom_options: {
				options: {
					comments: true,
					whitespace: true,
					minify: true,
					banner: "PHP Script 1.0"
				},
				files: {
					'tmp/custom.php': 'test/fixtures/**/*.php',
				},
			},
		},
		nodeunit: {
			tests: ['test/*_test.js'],
		},
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask(
		'test', [
			'clean',
			'phpacker',
			'nodeunit'
		]
	);
	grunt.registerTask(
		'default', [
			'jshint',
			'test'
		]
	);

};
