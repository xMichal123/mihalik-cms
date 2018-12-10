'use strict';
window.onload = function() {
	let guma = new Guma();
	//guma.addPage('<div><h1>Test Page</h1><p>New content goes here!</p></div>');
	guma.addPrismPageSet(
		[
			"one", "two", "three", "four", "five", "six", "seven",
		],
		[
		'<div style="background: red"><h1>Test Page</h1><p>New content goes here!</p></div>',
		'<div style="background: green"><h1>Test Page</h1><p>New content goes here!</p></div>',
		'<div style="background: blue"><h1>Test Page</h1><p>New content goes here!</p></div>',
		'<div style="background: cyan"><h1>Test Page</h1><p>New content goes here!</p></div>',
		'<div style="background: magenta"><h1>Test Page</h1><p>New content goes here!</p></div>',
		'<div style="background: orange"><h1>Test Page</h1><p>New content goes here!</p></div>',
		'<div style="background: yellow"><h1>Test Page</h1><p>New content goes here!</p></div>',
		]);
};
