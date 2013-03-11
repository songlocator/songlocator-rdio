###

  SongLocator resolver for rdio.

  2013 (c) Andrey Popp <8mayday@gmail.com>

###

{BaseResolver} = require 'songlocator-base'
{OAuth} = require 'oauth'

getArgs = (argc) ->
  args =
    method: null
    params: null
    callback: null

  if argc.length >= 1
    args['method'] = argc[0]

  if argc.length == 2
    if typeof argc[1] == 'function'
      args['callback'] = argc[1]
    else
      args['params'] = argc[1]

  else if  argc.length >= 3
    args['params'] = argc[1]
    args['callback'] = argc[2]

  args

class exports.Resolver extends BaseResolver
  name: 'rdio'
  score: 0.9

  endpoint: 'http://api.rdio.com/1/'

  constructor: ->
    super
    this.oauth = if this.options.consumerKey? and this.options.consumerSecret?
      new OAuth(
        'http://api.rdio.com/oauth/request_token',
        'http://api.rdio.com/oauth/access_token',
        this.options.consumerKey,
        this.options.consumerSecret,
        '1.0', 'oob', 'HMAC-SHA1')
    else
      throw new Error('provide consumerKey and consumerSecret')

  makeRequest: (method, params, callback) ->
    args = getArgs(arguments)
    params = args.params or {}
    params['method'] = args.method
    callback = args.callback or ->

    callbackWrapper = (error, results) ->
      try
        if results != null
          results = JSON.parse(results)
      catch e
      callback.call({}, error, results)

    accessToken = {}
    oauthToken = accessToken.oauthAccessToken or ''
    oauthTokenSecret = accessToken.oauthAccessTokenSecret or ''

    this.oauth.post(this.endpoint, oauthToken, oauthTokenSecret, params,
        'application/x-www-form-urlencoded', callbackWrapper)

  search: (qid, query) ->
    this.makeRequest 'search', {query: query, types: 'Track'}, (error, response) =>
      return if error?
      results = for r in response.result.results.slice(0, this.options.maxSearchResults)
        result =
          title: r.name
          artist: r.artist
          album: r.album

          source: this.name
          id: r.key

          linkURL: r.shortUrl
          imageURL: r.icon
          audioURL: undefined
          audioPreviewURL: undefined

          mimetype: undefined
          duration: r.duration

      this.results(qid, results)
