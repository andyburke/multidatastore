'use strict';

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

            await driver.put( serialized, options );
        }
    },

    get: async function( id, options ) {
        const drivers = this._drivers || [];
        const readable_driver = drivers.find( driver => {
            return driver && driver.options && driver.options.readable;
        } );

        if ( !readable_driver ) {
            throw new Error( 'missing readable driver' );
        }

        const serialized = await readable_driver.get( id, options );

        const processors = readable_driver.options.processors || [];
        const deserializers = processors.reverse().map( processor => {
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

    find: async function( criteria, options ) {
        const drivers = this._drivers || [];
        const searchable_driver = drivers.find( driver => {
            return driver && driver.options && typeof driver.options.find === 'function';
        } );

        if ( !searchable_driver ) {
            throw new Error( 'missing searchable driver' );
        }

        const serialized = await searchable_driver.options.find( criteria, options, searchable_driver );

        const processors = searchable_driver.options.processors || [];
        const deserializers = processors.reverse().map( processor => {
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

    singleton: async function( owner, drivers, _timeout ) {
        if ( owner._mds ) {
            return owner._mds;
        }

        const timeout = typeof _timeout === 'number' ? _timeout : 10000; // default to 10s timeout

        if ( owner._getting_mds ) {
            return new Promise( ( resolve, reject ) => {
                const started_waiting = Date.now();
                ( function _wait_for_mds() {
                    if ( !owner._getting_mds ) {
                        return resolve( owner._mds );
                    }

                    if ( timeout ) {
                        const waited = Date.now() - started_waiting;
                        if ( waited > timeout ) {
                            return reject( 'Timed out waiting for database.' );
                        }
                    }

                    setTimeout( _wait_for_mds, 100 );
                } )();
            } );
        }

        owner._getting_mds = true;
        owner._mds = await this.create( drivers );
        owner._getting_mds = false;

        return owner._mds;
    }
};
