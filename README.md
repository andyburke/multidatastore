<a name="module_multidatastore"></a>

## multidatastore
A wrapper around multiple data stores.


* [multidatastore](#module_multidatastore)
    * _static_
        * [.create(drivers)](#module_multidatastore.create)
        * [.singleton(owner, [options])](#module_multidatastore.singleton)
    * _inner_
        * [~Multi_Data_Store](#module_multidatastore..Multi_Data_Store)
            * [.init(drivers)](#module_multidatastore..Multi_Data_Store.init)
            * [.add_driver(driver)](#module_multidatastore..Multi_Data_Store.add_driver)
            * [.remove_driver(driver)](#module_multidatastore..Multi_Data_Store.remove_driver)
            * [.stop()](#module_multidatastore..Multi_Data_Store.stop)
            * [.put(object, [options])](#module_multidatastore..Multi_Data_Store.put)
            * [.get(id, [options], [driver])](#module_multidatastore..Multi_Data_Store.get)
            * [.find(criteria, [options], [driver])](#module_multidatastore..Multi_Data_Store.find)
            * [.find_by(criteria, [options], [driver])](#module_multidatastore..Multi_Data_Store.find_by)
            * [.del(id, [options])](#module_multidatastore..Multi_Data_Store.del)

<a name="module_multidatastore.create"></a>

### multidatastore.create(drivers)
Creates an MDS instance.

**Kind**: static method of [<code>multidatastore</code>](#module_multidatastore)  
**Summary**: Creates an MDS instance.  

| Param | Type | Description |
| --- | --- | --- |
| drivers | <code>Array.&lt;driver&gt;</code> | The initial MDS drivers to initialize with. |

<a name="module_multidatastore.singleton"></a>

### multidatastore.singleton(owner, [options])
Creates a singleton MDS based on an owner. Useful for ensuring only one instance
is created when accessing from multiple places in your code.

**Kind**: static method of [<code>multidatastore</code>](#module_multidatastore)  
**Summary**: Creates a singleton MDS instance.  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>object</code> | The owning object. |
| [options] | <code>object</code> | creation options |

<a name="module_multidatastore..Multi_Data_Store"></a>

### multidatastore~Multi\_Data\_Store
multidatastore Interface

**Kind**: inner interface of [<code>multidatastore</code>](#module_multidatastore)  

* [~Multi_Data_Store](#module_multidatastore..Multi_Data_Store)
    * [.init(drivers)](#module_multidatastore..Multi_Data_Store.init)
    * [.add_driver(driver)](#module_multidatastore..Multi_Data_Store.add_driver)
    * [.remove_driver(driver)](#module_multidatastore..Multi_Data_Store.remove_driver)
    * [.stop()](#module_multidatastore..Multi_Data_Store.stop)
    * [.put(object, [options])](#module_multidatastore..Multi_Data_Store.put)
    * [.get(id, [options], [driver])](#module_multidatastore..Multi_Data_Store.get)
    * [.find(criteria, [options], [driver])](#module_multidatastore..Multi_Data_Store.find)
    * [.find_by(criteria, [options], [driver])](#module_multidatastore..Multi_Data_Store.find_by)
    * [.del(id, [options])](#module_multidatastore..Multi_Data_Store.del)

<a name="module_multidatastore..Multi_Data_Store.init"></a>

#### Multi_Data_Store.init(drivers)
Initialize the MDS.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  

| Param | Type | Description |
| --- | --- | --- |
| drivers | <code>Array.&lt;driver&gt;</code> | A an array of datastore drivers. |

<a name="module_multidatastore..Multi_Data_Store.add_driver"></a>

#### Multi_Data_Store.add\_driver(driver)
Add a datastore driver to the MDS.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  

| Param | Type | Description |
| --- | --- | --- |
| driver | <code>driver</code> | A datastore driver. |

<a name="module_multidatastore..Multi_Data_Store.remove_driver"></a>

#### Multi_Data_Store.remove\_driver(driver)
Removes the given driver from the MDS.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  

| Param | Type | Description |
| --- | --- | --- |
| driver | <code>driver</code> | A datastore driver. |

<a name="module_multidatastore..Multi_Data_Store.stop"></a>

#### Multi_Data_Store.stop()
Stops the MDS, calling .stop() on all drivers.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  
<a name="module_multidatastore..Multi_Data_Store.put"></a>

#### Multi_Data_Store.put(object, [options])
Put an object into the MDS.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | The object to store. |
| [options] | <code>object</code> | storage options |

<a name="module_multidatastore..Multi_Data_Store.get"></a>

#### Multi_Data_Store.get(id, [options], [driver])
Get an object from the MDS.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The object id. |
| [options] | <code>object</code> | storage options |
| [driver] | <code>driver</code> | optionally get from a specific datastore driver |

<a name="module_multidatastore..Multi_Data_Store.find"></a>

#### Multi_Data_Store.find(criteria, [options], [driver])
Searches the MDS for an object based on specified criteria. Iterates through the available
drivers looking for one that supports the .find() method.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  
**Summary**: Find an object in the MDS.  

| Param | Type | Description |
| --- | --- | --- |
| criteria | <code>object</code> | An object containing search criteria. |
| [options] | <code>object</code> | search options |
| [driver] | <code>driver</code> | optionally search a specific datastore driver |

<a name="module_multidatastore..Multi_Data_Store.find_by"></a>

#### Multi_Data_Store.find\_by(criteria, [options], [driver])
Searches the MDS for an object based on a particular field. Iterates through the available
drivers looking for one that supports the .find_by() method. This is useful for datastores
that support special query indexing on a per-field basis.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  
**Summary**: Find an object in the MDS using a specific field.  

| Param | Type | Description |
| --- | --- | --- |
| criteria | <code>object</code> | An object containing search criteria. |
| [options] | <code>object</code> | search options |
| [driver] | <code>driver</code> | optionally search a specific datastore driver |

<a name="module_multidatastore..Multi_Data_Store.del"></a>

#### Multi_Data_Store.del(id, [options])
Deletes an object from the MDS.

**Kind**: static method of [<code>Multi\_Data\_Store</code>](#module_multidatastore..Multi_Data_Store)  
**Summary**: Delete an object in the MDS.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The object id. |
| [options] | <code>object</code> | deletion options |

