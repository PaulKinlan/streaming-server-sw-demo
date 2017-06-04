
const root = (dataPath, assetPath) => {
  
  let columnData = loadData(`${dataPath}columns.json`).then(r => r.json());
  let bodyTemplate = getCompiledTemplate(`${assetPath}templates/body.html`);
  const headStream = loadTemplate(`${assetPath}templates/head.html`);
  const bodyStream = bodyTemplate.then(renderFunction => renderFunction({
                       columns: columnData
                     }));
  const footStream = loadTemplate(`${assetPath}templates/foot.html`);


  let concatStream = new ConcatStream;
  return headStream.then(stream => stream.pipeTo(concatStream.writable, { preventClose:true }))
                .then(() => bodyStream)
                .then(stream => stream.pipeTo(concatStream.writable, { preventClose: true }))
                .then(() => footStream)
                .then(stream => stream.pipeTo(concatStream.writable))
                .then(() => new Response(concatStream.readable, { status: "200" }))
}

if (typeof module !== 'undefined' && module.exports) {
  var platform = require('../../scripts/platform/node.js');
  var common = require('../../scripts/platform/common.js');
  var loadTemplate = platform.loadTemplate;  
  var loadData = platform.loadData;
  var getCompiledTemplate = common.getCompiledTemplate;
  var ConcatStream = common.ConcatStream;
  const fetch = require('node-fetch');
  var Request = fetch.Request;
  var Response = fetch.Response;
  
  module.exports = {
    root: root
  }
}