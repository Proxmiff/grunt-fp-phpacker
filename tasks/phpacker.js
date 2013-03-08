'use strict';

var PHPacker = function (grunt, files, options) {
	this.grunt = grunt;
	this.files = files;
	this.job = {};
	this.options = options;
};

PHPacker.prototype = {

	obtainFiles: function () {
		var that = this;
		this.files.forEach(
			function (file) {
				var sources = file.src.filter(
					function (filepath) {
						if (!that.grunt.file.exists(filepath)) {
							that.grunt.log.warn(
								'Source file "' +
								filepath +
								'" not found.'
							);
							return false;
						} else {
							return true;
						}
					}
				);
				that.job[file.dest] = sources;
			}
		);
	},

	processFiles: function () {
		var that = this;
		for (var destination in this.job) {
			var codeChunks = [];
			for (var i = 0; i < this.job[destination].length; i++) {
				codeChunks.push(
					this.grunt.file.read(
						this.job[destination][i]
					)
				);
			}
			this.grunt.file.write(
				destination,
				this.processCodeChunks(codeChunks)
			);
			this.grunt.log.writeln(
				'File "' +
				destination +
				'" created.'
			);
		}
	},

	getBanner: function () {
		var code = '';
		var multiline = (
			Object.prototype.toString.call(this.options.banner) ===
			'[object Array]'
		);
		if (multiline) {
			code += '\n';
		}
		code += '/*';
		if (multiline) {
			code += '\n';
			for (var i = 0; i < this.options.banner.length; i++) {
				code += ' * ' + this.options.banner[i] + '\n';
			}
		} else {
			code += (
				' ' +
				this.options.banner +
				' '
			);
		}
		code += ' */\n';
		return code;
	},

	extractCode: function (data) {
		var code = '';
		var chars = data.split('');
		var codeSection = false;
		var insideString = false;
		var stringClosingChar = '';
		for (var i = 0; i < chars.length; i++) {
			var currentChar = chars[i];
			var nextChar = chars[i+1] ? chars[i+1] : '';
			var prevChar = chars[i-1] ? chars[i-1] : '';
			if (!codeSection) {
				if (data.substr(i, 5) === '<?php') {
					codeSection = true;
					i += 4;
					continue;
				}
				if (currentChar === '<' && nextChar === '?') {
					codeSection = true;
					i++;
					continue;
				}
			}
			if (codeSection && !insideString) {
				if (currentChar === '?' && nextChar === '>') {
					codeSection = false;
					i++;
					continue;
				}
			}
			if (codeSection) {
				if (!insideString) {
					if (currentChar === '"' || currentChar === "'") {
						insideString = true;
						stringClosingChar = currentChar;
					}
				} else if (insideString) {
					if (currentChar === stringClosingChar && prevChar !== "\\") {
						insideString = false;
						stringClosingChar = '';
					}
				}
				code += currentChar;
			}
		}
		return code;
	},

	minifyCode: function (data) {
		var result             = '';
		var chars              = data.split('');
		var stringClosingChar  = '';
		var insideString       = false;
		var insideComment      = false;
		var commentIsMultiline = false;
		var alreadySpaced      = false;
		for (var i = 0; i < chars.length; i++) {
			var currentChar = chars[i];
			var nextChar = chars[i+1] ? chars[i+1] : '';
			var prevChar = chars[i-1] ? chars[i-1] : '';
			if (!insideString && !insideComment) {
				if (currentChar === '/' && nextChar === '/') {
					insideComment = true;
					commentIsMultiline = false;
					i++;
					continue;
				} else if (currentChar === '/' && nextChar === '*') {
					insideComment = true;
					commentIsMultiline = true;
					i++;
					continue;
				}
			}
			if (!insideString && insideComment) {
				if (!commentIsMultiline && currentChar === "\n") {
					insideComment = false;
					commentIsMultiline = false;
				} else if (commentIsMultiline && currentChar === '*' && nextChar === '/') {
					insideComment = false;
					commentIsMultiline = false;
					i++;
					continue;
				}
			}
			if (!insideComment) {
				if (!insideString) {
					if (currentChar === '"' || currentChar === "'") {
						insideString = true;
						stringClosingChar = currentChar;
					}
				} else if (insideString) {
					if (currentChar === stringClosingChar && prevChar !== "\\") {
						insideString = false;
						stringClosingChar = '';
					}
				}
			}
			if (!insideComment && !insideString) {
				if (/\s+/.test(currentChar) === true) {
					if (!alreadySpaced) {
						result += ' ';
						alreadySpaced = true;
						continue;
					}
				} else {
					alreadySpaced = false;
					result += currentChar;
					continue;
				}
			}
			if (insideString) {
				result += currentChar;
			}
			//$result .= $currentChar;
		}
		return result;
	},

	processCodeChunks: function (codeChunks) {
		var code = '<?php ';
		if (this.options.banner) {
			code += this.getBanner();
		}
		for (var i = 0; i < codeChunks.length; i++) {
			var codeChunk = this.extractCode(codeChunks[i]);
			if (this.options.minify) {
				codeChunk = this.minifyCode(codeChunk);
			}
			code += codeChunk;
		}
		if (this.options.whitespace) {
			code += ' ';
		}
		code += '?>';
		return code;
	},

	run: function () {
		this.obtainFiles();
		this.processFiles();
	}

};

module.exports = function (grunt) {
	grunt.registerMultiTask(
		'phpacker',
		'Grunt plugin for PHP bundling',
		function () {
			var packer = new PHPacker(
				grunt,
				this.files,
				this.options({
						minify: false
					}
				)
			);
			packer.run();
		}
	);
};
