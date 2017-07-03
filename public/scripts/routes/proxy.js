const proxyHandler = (dataPath, assetPath, request) => {
  /* 
    Go out to the networks.
    
    Todo: Handle some caching here.
  */ 
  const url = parseUrl(request);
  return fetch(url);
}

if (typeof module !== 'undefined' && module.exports) {
  var platform = require('../../scripts/platform/node.js');
  var common = require('../../scripts/platform/common.js');
  var loadTemplate = platform.loadTemplate;  
  var loadData = platform.loadData;
  var getCompiledTemplate = common.getCompiledTemplate;
  var ConcatStream = common.ConcatStream;
  var fetch = require('node-fetch');
  var Request = fetch.Request;
  var Response = fetch.Response;
  
  var parseUrl = request => request.query.url;
  
  module.exports = {
    handler: proxyHandler
  }
}
else {
  routes['proxy'] = proxyHandler;
  
  var parseUrl = request => request.url; //new URL(request.url).searchParams.get('url');
}