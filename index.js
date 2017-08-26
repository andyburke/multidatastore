'use strict';

const Multi_Data_Store = {
    init: async function( _drivers ) {
        const drivers = _drivers || [];
        for ( let driver of drivers ) {
            this.drivers.add( driver );
            await driver.init();
        }
    },

    drivers: {
        add: function( driver ) {
            this._drivers = this._drivers || [];
            this._drivers.push( driver );
            return true;
        },

        remove: function( driver ) {
            this._drivers = this._drivers || [];
            const driver_index = this._drivers.indexOf( driver );

            if ( driver_index < 0 ) {
                return false;
            }

            this._drivers.splice( driver_index, 1 );
            return true;
        }
    },

    put: async function( object ) {
        const drivers = this.drivers._drivers || [];
        for ( let driver of drivers ) {
            await driver.put( object );
        }
    },

    get: async function( id ) {
        const drivers = this.drivers._drivers || [];
        const readable_driver = drivers.find( driver => {
            return driver && driver.options && driver.options.readable;
        } );

        if ( !readable_driver ) {
            throw new Error( 'missing readable driver' );
        }

        return await readable_driver.get( id );
    },

    del: async function( id  ) {
        const drivers = this.drivers._drivers || [];
        for ( let driver of drivers ) {
            if ( driver.options && driver.options.ignore_delete ) {
                continue;
            }

            await driver.del( id );
        }
    }
};

module.exports = {
    create: function() {
        const instance = Object.assign( {}, Multi_Data_Store );
        return instance;
    }
};
