console.log("starting some server");
/*
http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("guess what day it is!");
  //res.end('okay');
});
server.listen(8080);
*/

//log in with oddidev@bbg.gov, https://datamarket.azure.com/developer/applications/edit/kettlecorn


var MsTranslator = require('mstranslator');
var client = new MsTranslator({client_id:"kettlecorn", client_secret: "R4jo1o2NYoILOSVYk3r2QsrdYCnM7Siqnxz7aAash4g="});
var params = { 
  text: 'what is your name?'
  , from: 'en'
  , to: 'es'
};

client.initialize_token(function(keys){ 
  //console.log(keys.access_token);
  client.translate(params, function(err, data) {
      console.log(data);
  });
});