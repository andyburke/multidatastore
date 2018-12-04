/**
 * A wrapper around multiple data stores.
 * @module multidatastore
 */
'use strict';

const extend = require( 'extend' );

async function _deserialize( serialized, driver ) {
    const processors = driver.options.processors || [];
    const deserializers = processors.slice().reverse().map( processor => {
        return processor.deserialize ? processor.deserialize.bind( processor ) : null;
    } );

    const deserialized = Array.isArray( serialized ) ? serialized.slice( 0 ) : [ serialized ];

    for ( let index = 0, num = deserialized.length; index < num; ++index ) {
        for ( let deserializer of deserializers ) {
            if ( !deserializer ) {
                continue;
            }

            deserialized[ index ] = deserialized[ index ] ? await deserializer( deserialized[ index ] ) : deserialized[ index ];
        }
    }

    return Array.isArray( serialized ) ? deserialized : deserialized[ 0 ];
}

/**
 * multidatastore Interface
 *
 * @interface
 */
const Multi_Data_Store = {
    /**
     * Initialize the MDS.
     * @async
     * @function
     * @param {Array.<driver>} drivers - A an array of datastore drivers.
     */
    init: async function( _drivers ) {
        const drivers = _drivers || [];
        for ( let driver of drivers ) {
            this.add_driver( driver );
            await driver.init();
        }
    },

    /**
     * Add a datastore driver to the MDS.
     * @function
     * @param {driver} driver - A datastore driver.
     */
    add_driver: function( driver ) {
        this._drivers = this._drivers || [];
        this._drivers.push( driver );
        return true;
    },

    /**
     * Removes the given driver from the MDS.
     * @function
     * @param {driver} driver - A datastore driver.
     */
    remove_driver: function( driver ) {
        this._drivers = this._drivers || [];
        const driver_index = this._drivers.indexOf( driver );

        if ( driver_index < 0 ) {
            return false;
        }

        this._drivers.splice( driver_index, 1 );
        return true;
    },

    /**
     * Stops the MDS, calling .stop() on all drivers.
     * @async
     * @function
     */
    stop: async function() {
        const drivers = this._drivers || [];
        for ( let driver of drivers ) {
            if ( !driver.stop ) {
                continue;
            }

            await driver.stop();
        }
    },

    /**
     * Put an object into the MDS.
     * @async
     * @function
     * @param {object} object - The object to store.
     * @param {object} [options] - storage options
     */
    put: async function( object, options ) {
        const drivers = this._drivers || [];
        for ( let driver of drivers ) {

            async function write() {
                const processors = driver.options.processors || [];
                const serializers = processors.map( processor => {
                    return processor.serialize ? processor.serialize.bind( processor ) : null;
                } );

                let serialized = object;
                for ( let serializer of serializers ) {
                    if ( !serializer ) {
                        continue;
                    }

                    serialized = await serializer( serialized );
                }

                return await driver.put( serialized, options );
            }

            driver.options.await === false ? write() : await write();
        }
    },

    /**
     * Get an object from the MDS.
     * @async
     * @function
     * @param {string} id - The object id.
     * @param {object} [options] - storage options
     * @param {driver} [driver] - optionally get from a specific datastore driver
     */
    get: async function( id, options, _driver ) {
        const driver = _driver || ( this._drivers || [] ).find( driver => {
            return driver && driver.options && driver.options.readable;
        } );

        if ( !driver ) {
            throw new Error( 'missing readable driver' );
        }

        const serialized = await driver.get( id, options );

        const processors = driver.options.processors || [];
        const deserializers = processors.slice().reverse().map( processor => {
            return processor.deserialize ? processor.deserialize.bind( processor ) : null;
        } );

        let object = serialized;
        for ( let deserializer of deserializers ) {
            if ( !deserializer ) {
                continue;
            }

            object = object ? await deserializer( object ) : object;
        }

        return object;
    },

    /**
     * Searches the MDS for an object based on specified criteria. Iterates through the available
     * drivers looking for one that supports the .find() method.
     * @summary Find an object in the MDS.
     * @async
     * @function
     * @param {object} criteria - An object containing search criteria.
     * @param {object} [options] - search options
     * @param {driver} [driver] - optionally search a specific datastore driver
     */
    find: async function( criteria, options, _driver ) {
        const driver = _driver || ( this._drivers || [] ).find( driver => {
            return driver && driver.options && typeof driver.options.find === 'function';
        } );

        if ( !driver ) {
            throw new Error( 'missing searchable driver' );
        }

        const serialized = await driver.options.find( criteria, options, driver );
        const found = await _deserialize( serialized, driver );
        return found;
    },

    /**
     * Searches the MDS for an object based on a particular field. Iterates through the available
     * drivers looking for one that supports the .find_by() method. This is useful for datastores
     * that support special query indexing on a per-field basis.
     * @summary Find an object in the MDS using a specific field.
     * @async
     * @function
     * @param {object} criteria - An object containing search criteria.
     * @param {object} [options] - search options
     * @param {driver} [driver] - optionally search a specific datastore driver
     */
    find_by: async function( criteria, options, _driver ) {
        const driver = _driver || ( this._drivers || [] ).find( driver => {
            return driver && driver.options && typeof driver.options.find_by === 'function';
        } );

        if ( !driver ) {
            throw new Error( 'missing searchable driver' );
        }

        const serialized = await driver.options.find_by( criteria, options, driver );
        const found = await _deserialize( serialized, driver );
        return found;
    },

    /**
     * Deletes an object from the MDS.
     * @summary Delete an object in the MDS.
     * @async
     * @function
     * @param {string} id - The object id.
     * @param {object} [options] - deletion options
     */
    del: async function( id, options ) {
        const drivers = this._drivers || [];
        for ( let driver of drivers ) {
            if ( driver.options && driver.options.ignore_delete ) {
                continue;
            }

            await driver.del( id, options );
        }
    }
};

module.exports = {
    /**
     * Creates an MDS instance.
     * @summary Creates an MDS instance.
     * @async
     * @function
     * @param {Array.<driver>} drivers - The initial MDS drivers to initialize with.
     */
    create: async function( drivers ) {
        const instance = Object.assign( {}, Multi_Data_Store );

        if ( drivers && drivers.length ) {
            await instance.init( drivers );
        }

        return instance;
    },

    /**
     * Creates a singleton MDS based on an owner. Useful for ensuring only one instance
     * is created when accessing from multiple places in your code.
     * @summary Creates a singleton MDS instance.
     * @async
     * @function
     * @param {object} owner - The owning object.
     * @param {object} [options] - creation options
     */
    singleton: async function( owner, _options ) {
        if ( owner._mds ) {
            return owner._mds;
        }

        const options = extend( true, {
            timeout: 10000,
            precreate: null,
            postcreate: null,
            drivers: []
        }, _options );

        if ( owner._getting_mds ) {
            return new Promise( ( resolve, reject ) => {
                const started_waiting = Date.now();
                ( function _wait_for_mds() {
                    if ( !owner._getting_mds ) {
                        return resolve( owner._mds );
                    }

                    if ( options.timeout ) {
                        const waited = Date.now() - started_waiting;
                        if ( waited > options.timeout ) {
                            return reject( 'Timed out waiting for database.' );
                        }
                    }

                    setTimeout( _wait_for_mds, 100 );
                } )();
            } );
        }

        owner._getting_mds = true;

        if ( options.precreate ) {
            await options.precreate();
        }

        const create = options.create || this.create.bind( this );

        const mds = await create( options.drivers );

        if ( options.postcreate ) {
            await options.postcreate();
        }

        owner._mds = mds;

        owner._getting_mds = false;

        return owner._mds;
    }
};
