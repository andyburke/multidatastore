'use strict';

const Multi_Data_Store = require( '../index.js' );
const tape = require( 'tape-async' );

tape( 'API: imports properly', t => {
    t.ok( Multi_Data_Store, 'module exports' );
    t.equal( Multi_Data_Store && typeof Multi_Data_Store.create, 'function', 'exports create()' );
    t.end();
} );

tape( 'API: API is correct on instance', t => {

    const mds = Multi_Data_Store.create();

    t.ok( mds, 'got instance' );

    t.equal( mds && typeof mds.init, 'function', 'exports init' );
    t.equal( mds && typeof mds.stop, 'function', 'exports stop' );
    t.equal( mds && typeof mds.add_driver, 'function', 'exports add_driver' );
    t.equal( mds && typeof mds.remove_driver, 'function', 'exports remove_driver' );
    t.equal( mds && typeof mds.put, 'function', 'exports put' );
    t.equal( mds && typeof mds.get, 'function', 'exports get' );
    t.equal( mds && typeof mds.del, 'function', 'exports del' );

    t.end();
} );