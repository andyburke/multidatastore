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

            object = await deserializer( object, this.options );
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

        return await searchable_driver.options.find( criteria, options, searchable_driver );
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
    }
};
