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

    t.equal( mds && typeof mds.drivers, 'object', 'exports drivers object' );
    t.equal( mds && typeof mds.init, 'function', 'exports init' );
    t.equal( mds && mds.drivers && typeof mds.drivers.add, 'function', 'exports drivers.add' );
    t.equal( mds && mds.drivers && typeof mds.drivers.remove, 'function', 'exports drivers.remove' );
    t.equal( mds && typeof mds.put, 'function', 'exports put' );
    t.equal( mds && typeof mds.get, 'function', 'exports get' );
    t.equal( mds && typeof mds.del, 'function', 'exports del' );

    t.end();
} );