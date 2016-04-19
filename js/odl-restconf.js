var config = require( './config' );
var request = require( 'request' );

exports.forward_get = function( req, res ) {
  var opts = { url: config.odl_server_path + "/restconf/" + req.params[0]
             , headers: { 'Authorization': 'Basic ' + config.oauth_token } };

  request.get( opts
             , function( error, response, data ) {
                 if ( !error && response.statusCode == 200 ) {
                     res.writeHead( 200, { 'Content-Type': 'application/json' } );
                     res.write( data );
                     res.end();
                 } else {
                     console.error( "read data failed" );
                 }
               } );
}

exports.forward_post = function( req, res ) {
  var opts = { url: config.odl_server_path + "/restconf/" + req.params[0]
               , headers: { 'Authorization': 'Basic ' + config.oauth_token }
               , json: {
                   "input": {
                       "source": req.body.source,
                       "destination": req.body.destination
                   }
               }};

  request.post( opts,
                  function( error, response, data) {
                      if (!error && response.statusCode == 200 ) {
                          res.writeHead( 200, { 'Content-Type': 'application'} );
                          res.write( data );
                          res.end();
                      } else {
                          console.error( "post request failed" );
                      }
                  });
}
