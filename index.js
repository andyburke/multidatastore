'use strict';

const extend = require( 'extend' );

const Multi_Data_Store = {
    init: async function( _drivers ) {
        const drivers = _drivers || [];
        for ( let driver of drivers ) {
            this.add_driver( driver );
            await driver.init();
        }
    },

    add_driver: function( driver ) {
        this._drivers = this._drivers || [];
        this._drivers.push( driver );
        return true;
    },

    remove_driver: function( driver ) {
        this._drivers = this._drivers || [];
        const driver_index = this._drivers.indexOf( driver );

        if ( driver_index < 0 ) {
            return false;
        }

        this._drivers.splice( driver_index, 1 );
        return true;
    },

    stop: async function() {
        const drivers = this._drivers || [];
        for ( let driver of drivers ) {
            if ( !driver.stop ) {
                continue;
            }

            await driver.stop();
        }
    },

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

                    serialized = await serializer( serialized, this.options );
                }

                return await driver.put( serialized, options );
            }

            driver.options.await === false ? write() : await write();
        }
    },

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

            object = object ? await deserializer( object, this.options ) : object;
        }

        return object;
    },

    find: async function( criteria, options, _driver ) {
        const driver = _driver || ( this._drivers || [] ).find( driver => {
            return driver && driver.options && typeof driver.options.find === 'function';
        } );

        if ( !driver ) {
            throw new Error( 'missing searchable driver' );
        }

        const serialized = await driver.options.find( criteria, options, driver );

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

                deserialized[ index ] = deserialized[ index ] ? await deserializer( deserialized[ index ], this.options ) : deserialized[ index ];
            }
        }

        const found = Array.isArray( serialized ) ? deserialized : deserialized[ 0 ];
        return found;
    },

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
    create: async function( drivers ) {
        const instance = Object.assign( {}, Multi_Data_Store );

        if ( drivers && drivers.length ) {
            await instance.init( drivers );
        }

        return instance;
    },

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
