'use strict';

var grunt = require('grunt');

exports.phpacker = {

	setUp: function(done) {
		done();
	},

	cool: function(test) {
		test.expect(1);
		test.equal(2 * 2, 4, '1=1??');
		test.done();
	}

};
