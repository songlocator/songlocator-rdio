//@ sourceMappingURL=songlocator-rdio.map
// Generated by CoffeeScript 1.6.1
/*

  SongLocator resolver for rdio.

  2013 (c) Andrey Popp <8mayday@gmail.com>
*/

var BaseResolver, OAuth, getArgs,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseResolver = require('songlocator-base').BaseResolver;

OAuth = require('oauth').OAuth;

getArgs = function(argc) {
  var args;
  args = {
    method: null,
    params: null,
    callback: null
  };
  if (argc.length >= 1) {
    args['method'] = argc[0];
  }
  if (argc.length === 2) {
    if (typeof argc[1] === 'function') {
      args['callback'] = argc[1];
    } else {
      args['params'] = argc[1];
    }
  } else if (argc.length >= 3) {
    args['params'] = argc[1];
    args['callback'] = argc[2];
  }
  return args;
};

exports.Resolver = (function(_super) {

  __extends(Resolver, _super);

  Resolver.prototype.name = 'rdio';

  Resolver.prototype.score = 0.9;

  Resolver.prototype.endpoint = 'http://api.rdio.com/1/';

  function Resolver() {
    Resolver.__super__.constructor.apply(this, arguments);
    this.oauth = (function() {
      if ((this.options.consumerKey != null) && (this.options.consumerSecret != null)) {
        return new OAuth('http://api.rdio.com/oauth/request_token', 'http://api.rdio.com/oauth/access_token', this.options.consumerKey, this.options.consumerSecret, '1.0', 'oob', 'HMAC-SHA1');
      } else {
        throw new Error('provide consumerKey and consumerSecret');
      }
    }).call(this);
  }

  Resolver.prototype.makeRequest = function(method, params, callback) {
    var accessToken, args, callbackWrapper, oauthToken, oauthTokenSecret;
    args = getArgs(arguments);
    params = args.params || {};
    params['method'] = args.method;
    callback = args.callback || function() {};
    callbackWrapper = function(error, results) {
      try {
        if (results !== null) {
          results = JSON.parse(results);
        }
      } catch (e) {

      }
      return callback.call({}, error, results);
    };
    accessToken = {};
    oauthToken = accessToken.oauthAccessToken || '';
    oauthTokenSecret = accessToken.oauthAccessTokenSecret || '';
    return this.oauth.post(this.endpoint, oauthToken, oauthTokenSecret, params, 'application/x-www-form-urlencoded', callbackWrapper);
  };

  Resolver.prototype.search = function(qid, query) {
    var _this = this;
    return this.makeRequest('search', {
      query: query,
      types: 'Track'
    }, function(error, response) {
      var r, result, results;
      if (error != null) {
        return;
      }
      results = (function() {
        var _i, _len, _ref, _results;
        _ref = response.result.results.slice(0, this.options.maxSearchResults);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          r = _ref[_i];
          _results.push(result = {
            title: r.name,
            artist: r.artist,
            album: r.album,
            source: this.name,
            id: r.key,
            linkURL: r.shortUrl,
            imageURL: r.icon,
            audioURL: void 0,
            audioPreviewURL: void 0,
            mimetype: void 0,
            duration: r.duration
          });
        }
        return _results;
      }).call(_this);
      return _this.results(qid, results);
    });
  };

  return Resolver;

})(BaseResolver);