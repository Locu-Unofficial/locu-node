module.exports = function(){

APIException = function(url, params, error, response, body){
  this.url = url;
  this.params = params;
  this.error = error;
  this.response = response;
  this.body = body;
  return this;
};

LocuClient = function(api_key, server_url, version_str){
  this.__request = require('request');
  this.__request.defaults({json: true});

  this.api_key = api_key;
  this.api_version_str = version_str || '1_0';
  this.server_url = server_url || 'http://api_staging.locu.com';
  this.base = this.server_url + '/' + this.api_version_str + '/'; // used for all HTTP requests

  this.format_params = function(params){
    return params;
  };

  this.request = function(service, params, cb){
    url = this.base + service + '/';
    
    cb = cb || function(){};

    params = params || {};
    params.api_key = params.api_key || this.api_key; // automatically include API key
    params = this.format_params(params);

    this.__request.get(url, params, function(err, resp, body){
      if (err || resp.status_code != 200) {
        throw APIException(url, params, err, resp, body);
      }
      else {
        cb(body); // body is JSON response
      }
    });
  };

  this.search = function(){
    throw "Not implemented";
  };
  this.search_next = function(){
    throw "Not implemented";
  };
  this.insight = function(){
    throw "Not implemented";
  };

  return this;
};

MenuItemClient = function(api_key, server_url, version_str){
  client = LocuClient(api_key, server_url, version_str);
  return client;
};

VenueClient = function(api_key, server_url, version_str){
  client = LocuClient(api_key, server_url, version_str);
  return client;
};


return this;}();
