'use strict';

const extend = require( 'extend' );
const Multi_Data_Store = require( '../index.js' );
const tape = require( 'tape-async' );

const Memory_Driver = {
    create: function( _options ) {
        const options = extend( true, {
            readable: true,
            id_field: 'id'
        }, _options );

        const driver = {
            init: async function() {
                this.store = {};
            },

            put: async function( object ) {
                this.store[ object[ this.options.id_field ] ] = object;
            },

            get: async function( id ) {
                return this.store[ id ];
            },

            del: async function( id ) {
                delete this.store[ id ];
            }
        };

        const instance = Object.assign( {}, driver );

        instance.options = options;

        return instance;
    }
};

tape( 'Mock Driver', async t => {
    const mds = Multi_Data_Store.create();
    mds.init( [ Memory_Driver.create() ] );

    const test_object = {
        id: 'foo',
        value: 'bar'
    };

    await mds.put( test_object );
    t.pass( 'put test object' );

    const returned_object = await mds.get( 'foo' );

    t.deepEqual( returned_object, test_object, 'got back appropriate object' );

    await mds.del( 'foo' );
    t.pass( 'deleted test object' );

    const deleted_object = await mds.get( 'foo' );

    t.notOk( deleted_object, 'once delted, cannot get object from store' );

    t.end();
} );
