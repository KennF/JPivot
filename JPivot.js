(function(window){
	var JPivot,
		config,
		Date = window.Date,
		config = {
			// The queue of tests to run
			queue: [],

		},
		defined = {
			setTimeout: typeof window.setTimeout !== "undefined",
		};

	function Test( settings ) {
		extend( this, settings );

    }
    Test.count = 0;
    Test.prototype = {
    	init: function() {
    		log("test.init");
		},
		setup: function() {
			log("test.setup");
		},
		run: function() {
			log("test.run");
			this.callback.call();
		},
		teardown: function() {
			log("test.teardown");
		},
		finish: function() {
			log("test.finish");
		},
		queue: function() {
			log("test.queue");
			var test = this;

			synchronize(function() {
				test.init();
			});
			function run() {
				// each of these can by async
				synchronize(function() {
					test.setup();
				});
				synchronize(function() {
					test.run();
				});
				synchronize(function() {
					test.teardown();
				});
				synchronize(function() {
					test.finish();
				});
			}
			synchronize( run, true );
			
		}
    };

	JPivot = {
        // module: function( name, testEnvironment ) {
        // },
        // asyncTest: function( testName, expected, callback ) {
        // },
        test: function( testName, expected, callback )//, async )
        {
	        var test,			
			if ( arguments.length === 2 ) {
				callback = expected;
				expected = null;
			}

			test = new Test({
				// name: name,
				testName: testName,
				expected: expected,
				// async: async,
				callback: callback,
				// module: config.currentModule,
				// moduleTestEnvironment: config.currentModuleTestEnvironment,
				// stack: sourceFromStacktrace( 2 )
			});

			// if ( !validTest( test ) ) {
			// 	return;
			// }

			test.queue();
        },
        expect: function( asserts ) {
        },
        start: function( count ) {
        	log("JPivot.start");
        },
        stop: function( count ) {
        	log("JPivot.stop");
        }
    };

    JPivot.assert = {
        ok: function( result, msg ) {
        },
        equal: function( actual, expected, message ) {
        },
        notEqual: function( actual, expected, message ) {
        },
        deepEqual: function( actual, expected, message ) {
        },
        notDeepEqual: function( actual, expected, message ) {
        },
        strictEqual: function( actual, expected, message ) {
        },
        notStrictEqual: function( actual, expected, message ) {
        },
        "throws": function( block, expected, message ) {
        }
    };

    extend( JPivot, JPivot.assert );

    if ( typeof exports === "undefined" ) {
        extend( window, JPivot );

        window.JPivot = JPivot;
    }

    // Extend JPivot object,
	// these after set here because they should not be exposed as global functions
	extend( JPivot, {
		config: config,
		init: function() {
			log("init");
			extend( config, {
				autorun: true,
				autostart: true,
				blocking: false,
				updateRate: 1000,
				queue: []
			});
		}
	});

	// We want access to the constructor's prototype
	(function() {
		function F() {}
		F.prototype = JPivot;
		JPivot = new F();
		// Make F JPivot's constructor so that we can add to the prototype later
		JPivot.constructor = F;
	}());

	JPivot.load = function() {
		log("HERE IS THE ENTRY");
		JPivot.init();
		if ( config.autostart ) {
			JPivot.start();
		}
		
	};

	addEvent( window, "load", JPivot.load );

	function done() {
		log("done");
	}

	function synchronize( callback, last ) {
		//log("push " + typeof callback)
		config.queue.push( callback );
		if ( config.autorun && !config.blocking ) {
			process( last );
		}
	}

	function process( last ) {
		function next() {
			process( last );
		}
		//log("process");
		var start = new Date().getTime();
		//log(new Date());
		config.depth = config.depth ? config.depth + 1 : 1;
		//log("+1 config.depth:" + config.depth.toString());
		while ( config.queue.length && !config.blocking ) {
			if ( !defined.setTimeout || config.updateRate <= 0 || ( ( new Date().getTime() - start ) < config.updateRate ) ) {
				config.queue.shift()();
			} else {
				window.setTimeout( next, 13 );
				break;
			}
		}
		//log("-1 config.depth:" + config.depth.toString());
		config.depth--;
		if ( last && !config.blocking && !config.queue.length && config.depth === 0 ) {
			done();
		}
	}

	function extend( a, b ) {
		for ( var prop in b ) {
			if ( b[ prop ] === undefined ) {
				delete a[ prop ];

			// Avoid "Member not found" error in IE8 caused by setting window.constructor
			} else if ( prop !== "constructor" || a !== window ) {
				a[ prop ] = b[ prop ];
			}
		}

		return a;
	}

	function addEvent( elem, type, fn ) {
		if ( elem.addEventListener ) {
			elem.addEventListener( type, fn, false );
		} 
		else if ( elem.attachEvent ) {
			elem.attachEvent( "on" + type, fn );
		} 
		else {
			fn();
		}
	}

	
// get at whatever the global object is, like window in browsers
}( (function() {return this;}.call()) ));



