# Locu + Node = `<3`

Want to play with the [Locu API](http://dev.locu.com)? Awesome!
Want to do it with node.js? Even more awesome! Here's a little
wrapper for doing *exactly* that. This is unofficial, but should
help you get going right away.

# Installation

Either clone this repository (`git clone git@github.com:Locu-Unofficial/locu-node.git`)
or install it with the Node Package Manager (`npm install https://github.com/Locu-Unofficial/locu-node/tarball/master`). Boom.

# Documentation

There are some good comments in [the source](https://github.com/Locu-Unofficial/locu-node/blob/master/locu.js),
but you should definitely check out [our REST API docs](http://dev.locu.com) to figure out what parameters are
allowed and what they do.

# Usage

Find somewhere selling espresso in San Francisco:

```javascript
> var locu = require('locu');
> var my_api_key = 'foobar3foobar3'; // swap this out for your own
> var mclient = locu.MenuItemClient(my_api_key);
> mclient.search({name:'espresso', locality:'San Francisco'}, function(result){
... console.log(result.objects[0]);
... });

{ description: '',
  id: 'c2a0ff8d200d0632cfa3a5786c9ccb272f955fe318ddc38191e22833774c929e',
  name: 'Espresso\r',
  price: 2.5,
  resource_uri: '/v1_0/menu_item/c2a0ff8d200d0632cfa3a5786c9ccb272f955fe318ddc38191e22833774c929e/',
  venue: 
   { categories: [ 'restaurant' ],
     country: 'United States',
     id: 'a8f7e3e4d0b0f1d85500',
     lat: 37.796938,
     locality: 'San Francisco',
     long: -122.435926,
     name: 'Gamine',
     postal_code: '94123',
     region: 'CA',
     street_address: '2223 Union St.' } }
> ^D
```

Find [Blue Bottle Coffee](http://www.bluebottlecoffee.com/):

```javascript
> var locu = require('locu');
> var my_api_key = 'foobar3foobar3'; // swap this out for your own
> var vclient = locu.VenueClient(my_api_key);
> var blue_bottle;
> vclient.search({name:'Blue Bottle Coffee', locality: 'San Francisco'}, function(resposne){
... blue_bottle = response.objects[0];
});
> blue_bottle;
{ categories: [ 'restaurant' ],
  country: 'United States',
  cuisines: [ 'coffee / tea' ],
  has_menu: true,
  id: 'd32b6888a6fbba7656c3',
  last_updated: '2012-09-05T06:00:37',
  lat: 37.782409,
  locality: 'San Francisco',
  long: -122.407711,
  name: 'Blue Bottle Coffee',
  postal_code: '94103',
  region: 'CA',
  resource_uri: '/v1_0/venue/d32b6888a6fbba7656c3/',
  street_address: '66 Mint St.',
  website_url: 'http://www.bluebottlecoffee.net/locations/mint-cafe/' }
> ^D
```

