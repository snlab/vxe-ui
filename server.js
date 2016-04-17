var colors = require( 'colors' );
var express = require( 'express' );
var app = express();
var bodyParser = require( 'body-parser' );
var request = require( 'request' );
var odl_restconf = require( './js/odl-restconf' );

var Server = function( port ) {
    app.use( express.static( '.' ) );
    app.use( bodyParser.json() );

    app.get( '/', function( req, res ) {
        res.writeHead( 302, { Location: '/index.html' } );
        res.end();
    });

    app.get( '/restconf/*', odl_restconf.forward );

    port = port || 3000;
    app.listen( port );

    process.stdout.write( "server started:\t" + ( "http://localhost:" + port ).green + "\n" );

    return { port: port };
};

var server = new Server();
