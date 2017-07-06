// handler
const root = (dataPath, assetPath) => {
  
  let columnData = loadData(`${dataPath}columns.json`).then(r => r.json());

  
  let headTemplate = getCompiledTemplate(`${assetPath}templates/head.html`);
  let bodyTemplate = getCompiledTemplate(`${assetPath}templates/body.html`);
  let itemTemplate = getCompiledTemplate(`${assetPath}templates/item.html`);
  
  let jsonFeedData = fetchCachedFeedData(columnData, itemTemplate);
  
  /*
   * Render the head from the cache or network
   * Render the body.
     * Body has template that brings in config to work out what to render
     * If we have data cached let's bring that in.
   * Render the footer - contains JS to data bind client request.
  */
  
  const headStream = headTemplate.then(render => render({ columns: columnData }));
  const bodyStream = jsonFeedData.then(columns => bodyTemplate.then(render => render({ columns: columns })));
  const footStream = loadTemplate(`${assetPath}templates/foot.html`);

  let concatStream = new ConcatStream;
  
  headStream.then(stream => stream.pipeTo(concatStream.writable, { preventClose:true }))
                .then(() => bodyStream)
                .then(stream => stream.pipeTo(concatStream.writable, { preventClose: true }))
                .then(() => footStream)
                .then(stream => stream.pipeTo(concatStream.writable));
  
  return Promise.resolve(new Response(concatStream.readable, { status: "200" }))
}


// Helpers
const fetchCachedFeedData = (columnData, itemTemplate) => {
  // Return a promise that resolves to a map of column id => cached data.
  const resolveCache = (cache, url) => (!!cache) ? cache.match(new Request(url)).then(response => (!!response) ? response.text() : undefined) : Promise.resolve();
  const mapColumnsToCache = (cache, columns) => columns.map(column => [column, resolveCache(cache, `https://feeddeck.glitch.me/proxy?url=${column.feedUrl}`)]);
  const mapCacheToTemplate = (columns) => columns.map(column => [column[0], column[1].then(items => convertRSSItemsToJSON(items))]);
    
  return caches.open('data')
      .then(cache => columnData.then(columns => mapColumnsToCache(cache, columns)))
      .then(columns => mapCacheToTemplate(columns));
};

const convertRSSItemsToJSON = (item) => {
  if(item == undefined) return;
  
  const findNode = (root, tagName) => {
    // depth first search.
    if(root.name === tagName) {
      return root;
    }
    else {
      for(let node of root.children) {
        let foundNode = findNode(node, tagName);
        if(foundNode != null) return foundNode;
      }
      
      return null;
    }
  };
  
  const findAllNodes = (root, tagName) => {
    // depth first search.
    let nodes = [];
    
    if(root.name === tagName) {
      nodes.push(root);
    }
    
    for(let node of root.children) {
      nodes = nodes.concat(findAllNodes(node, tagName));
    }
    
    return nodes
  };
  
  const getElementText = (root, text) => {
    let node = findNode(root, text);
    if(node) return node.content;
    return;
  };
  
  const createNode = (item) => {
    const title = getElementText(item, "title");
    const description = getElementText(item, "description");
    const guid = getElementText(item, "guid");
    const pubDate = getElementText(item, "pubDate");
    const author = getElementText(item, "author");
    const link = getElementText(item, "link");

    return {"title": title, "guid": guid, "description": description, "pubDate": pubDate, "author": author, "link": link};
  } 
  
  const xmlDom = parse(item);  
  const itemNodes = findAllNodes(xmlDom.root, 'item');
  const nodes = [];
  
  for(let node of itemNodes) {
    nodes.push(createNode(node));
  }
  return nodes;
};



if (typeof module !== 'undefined' && module.exports) {
  var platform = require('../../scripts/platform/node.js');
  var common = require('../../scripts/platform/common.js');
  var parse = require('../xml-parser.js').parse; //loaded like this because I need it in SW
  var loadTemplate = platform.loadTemplate;  
  var loadData = platform.loadData;
  var getCompiledTemplate = common.getCompiledTemplate;
  var ConcatStream = common.ConcatStream;
  const fetch = require('node-fetch');
  var Request = fetch.Request;
  var Response = fetch.Response;
  
  // Really need a Cache API on the server.....
  caches = new (function() {
    this.open = () => {
      return Promise.resolve(undefined);
    };
  });
  
  module.exports = {
    handler: root
  }
}
else {
  routes['root'] = root;
}