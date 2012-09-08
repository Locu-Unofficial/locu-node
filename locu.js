module.exports = (function(){

/* An exception to be thrown if something goes wrong with the API.
Includes information about what request was trying to be made,
and what the server responded. */
var APIException = function(url, params, error, response, body){
  this.url = url;
  this.params = params;
  this.error = error;
  this.response = response;
  this.body = body;
  return this;
};

/* The "base" Locu API client. Both server_url and version_str are
optional arguments, but api_key is necessary for interaction with
the API. Provides helper methods for formatting and making requests
to the API, but should never be used by itself. Instead, use
a MenuItemClient or a VenueClient, which build upon this. */
var LocuClient = function(api_key, server_url, version_str){
  this.__request = require('request'); // make useful request libraries useful
  this.__qs = require('querystring');
   
  if (!api_key){
    throw "Must supply an API key";
  }

  this.debug = false; // manually set this to true for debug messages
  this.api_key = api_key;
  this.api_version_str = version_str || 'v1_0';
  this.server_url = server_url || 'http://api_staging.locu.com';
  this.base = this.server_url + '/' + this.api_version_str + '/'; // used for all HTTP requests

  /* Cleans up parameters and formats them for use with our REST API.
  Please check our docs (http://dev.locu.com) for information about what
  are and aren't valid parameters, and in what formats. One thing that
  *is* different between those docs and here: bounding box / location
  field syntax.

  Instead of making you format your locations as strings ,we do it for you.
  If you wanted to search for a location with latitude 47.284 and longitude
  -133.219, your parameters map would include the following:
    {
      location: [47.284, -133.219],
    }
  This function will take that and format it for our API, turning it into:
    'location=47.284,-133.219'
  A similar transformation is applied to bounding boxes, which are defined
  a pair of locations, tl_coord and br_coord (top left, bottom right)
    {
      tl_coord: [35.15, -133.02],
      br_coord: [36.91, -130.31],
    }
  are transformed into:
    'bounds=36.15,-133.02|36.91,-130.31'
  */

  this.format_params = function(params){
    var clean = params;
    if (clean.location) {
      clean.location = '' + clean.location[0] + ',' + clean.location[1];
    }
    if (clean.has_menu) {
      clean.has_menu = true;
    }
    if (clean.tl_coord && clean.br_coord) {
      clean.bounds = '' + clean.tl_coord[0] + ',' + clean.tl_coord[1] + 
                     '|' + clean.br_coord[0] + ',' + clean.br_coord[1];
      delete clean.tl_coord;
      delete clean.br_coord;
    }
    return clean;
  };

  /* Helper function for making requests to any resource,
  wrapping the response in an exception handler and JSON
  parser. */
  this._request = function(url, params, cb){
    var url = url + '?' + this.__qs.stringify(params);
    if (this.debug) {
      console.log('----------------');
      console.log(url);
      console.log(params);
      console.log('----------------');
    }
    this.__request.get(url, function(err, resp, body){
      if (err || resp.statusCode != 200){
        console.log('Error!');
        console.log(url);
        console.log(params);
        console.log(err);
        console.log(resp);
        console.log(body);
        throw APIException(url, params, err, resp, body);
        //cb(null);
      }
      else {
        cb(JSON.parse(body));
      }
    });
  };

  /* Helper function for making a request to our API. Automatically
  fills in api_key details and formats the parameters being sent in.*/
  this.request = function(service, params, cb){
    url = this.base + service + '/';
    
    cb = cb || function(){};

    params = params || {};
    params.api_key = params.api_key || this.api_key; // automatically include API key
    params = this.format_params(params);

    this._request(url, params, cb);
  };

  /* Uses our search API to look for resources. Running this function
  from LocuClient won't work because it doesn't know what to look for.
  See either VenueClient and MenuItemClient for more information about
  parameters. */
  this.search = function(params, callback){
    this.request('search', params, callback);
  };

  /* Some of our advanced users get more than the default number of results
  in their searches. We paginate the results by including the next API
  request URL in the result. Given a result, this function will either return
  the next results or an empty object. */
  this.search_next = function(result, callback){
    var next = (result.meta || {}).next;
    if (!next) {
      callback(null);
    }
    else {
      url = this.server_url + next;
      this._request(url, {}, callback);
    }
  };

  /* Receive insight about a specific dimension. Our documentation,
  available at http://dev.locu.com, can tell you more about the valid
  parameters and response format. */
  this.insight = function(dimension, params, callback){
    params.dimension = dimension;
    this.request('insight', params, callback);
  };
  
  this.get_details = function(ids, callback){
    if (ids.length > 5){
      ids = ids.slice(0, 5); // limit to the first 5 ids
    }
    var id_param = ids.join(';');
    this.request(id_param, {}, callback);
  };

  return this;
};

/* Want to query our API about MenuItems? Use this.

> var my_client = MenuItemClient('my_api_key');
> my_client.search({
  name:'pizza',
  description:'delicious',
  locality:'san francisco'
  }, function(result){
    console.log(result);
  }
)

*/
var MenuItemClient = function(api_key, server_url, version_str){
  client = LocuClient(api_key, server_url, version_str);
  client.base = client.base + 'menu_item/';

  return client;
};

/* Want to query our API for Venues? Use this.

> var my_client = VenueClient('my_api_key');
> my_client.search({
  name:'Blue Bottle Coffee',
  locality:'san francisco'
  }, function(result){
    console.log(result);
  }
)

*/
var VenueClient = function(api_key, server_url, version_str){
  client = LocuClient(api_key, server_url, version_str);
  client.base = client.base+'venue/'

  client.get_menus = function(id, callback){
    this.get_details([id], function(data){
      var objects = data.objects || [],
          menus = objects.map(function(obj){obj.menus});

      menus = menus.filter(function(x){return x}); // get rid of undefined
      callback(menus);
    });
  };

  return client;
};

return {
  MenuItemClient: MenuItemClient,
  VenueClient: VenueClient,
  APIException: APIException,
};

})();

