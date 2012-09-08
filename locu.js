module.exports = (function(){

var APIException = function(url, params, error, response, body){
  this.url = url;
  this.params = params;
  this.error = error;
  this.response = response;
  this.body = body;
  return this;
};

var LocuClient = function(api_key, server_url, version_str){
  this.__request = require('request');
  this.__qs = require('querystring');
  this.__request.defaults({json: true});
  this._request = function(url, params, cb){
    console.log('----------------');
    console.log(url);
    console.log(params);
    console.log('----------------');
    var url = url + '?' + this.__qs.stringify(params);
    this.__request.get(url, function(err, resp, body){
      if (err || resp.statusCode != 200){
        console.log('Error!');
        console.log(url);
        console.log(params);
        console.log(err);
        console.log(resp);
        console.log(body);
        throw APIException(url, params, err, resp, body);
      }
      else {
        cb(JSON.parse(body));
      }
    });
  };

  this.api_key = api_key;
  this.api_version_str = version_str || 'v1_0';
  this.server_url = server_url || 'http://api_staging.locu.com';
  this.base = this.server_url + '/' + this.api_version_str + '/'; // used for all HTTP requests


  this.request = function(service, params, cb){
    url = this.base + service + '/';
    
    cb = cb || function(){};

    params = params || {};
    params.api_key = params.api_key || this.api_key; // automatically include API key
    params = this.format_params(params);

    this._request(url, params, cb);
  };
  
  this.format_params = function(params){
    var clean = params;
    if (clean.location) {
      clean.location = '' + clean.location[0] + ',' + clean.location[1];
    }
    if (clean.has_menu) {
      clean.has_menu = true;
    }
    if (clean.tl_lat && clean.tl_long && clean.br_lat && clean.br_long){
      clean.bounds = '' + clean.tl_lat + ',' + clean.tl_long + 
                     '|' + clean.br_lat + ',' + clean.br_long;
      delete clean.tl_lat;
      delete clean.tl_long;
      delete clean.br_lat;
      delete clean.br_long;
    }
    return clean;
  };
  
  this.search = function(params, callback){
    this.request('search', params, callback);
  };

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

  this.insight = function(dimension, params, callback){
    params.dimension = dimension;
    this.request('insight', params, callback);
  };

  return this;
};

var MenuItemClient = function(api_key, server_url, version_str){
  client = LocuClient(api_key, server_url, version_str);
  client.base = client.base + 'menu_item/';

  return client;
};

var VenueClient = function(api_key, server_url, version_str){
  client = LocuClient(api_key, server_url, version_str);
  client.base = client.base+'venue/'

  client.get_details = function(ids, callback){
    if (ids.length > 5){
      ids = ids.slice(0, 5);
    }
    var id_param = ids.join(';');
    this.request(id_param, {}, callback);
  };

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

