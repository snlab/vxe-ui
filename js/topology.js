var topoData;

function createTask(srcMac, dstMac) {
    $.ajax({
        url: "/restconf/operations/vxe-opendaylight-demo:setup-path/",
        type: 'POST',
        data: {
            source: srcMac,
            destination: dstMac
        },
        success: function (data) {
            // TODO
        }
    });
}

function getInventory(rawTopo) {
    $.ajax({
        url: "/restconf/operational/opendaylight-inventory:nodes/",
        type: 'GET',
        headers: {
            'Authorization': 'Basic ' + config.oauth_token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            topoData = transform(rawTopo, data);
            topo.data(topoData);
        }
    });
}

function getTopology() {
    $.ajax({
        url: "/restconf/operational/network-topology:network-topology/",
        type: 'GET',
        headers: {
            'Authorization': 'Basic ' + config.oauth_token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            getInventory(data);
        }
    });
}

function transform(rawTopo, inv) {
    var out = {};
    var intermediates = {};

    // save a map of links that have been taken down
    intermediates.downlinks = {};
    inv.nodes.node.forEach( function( node ) {
        node[ "node-connector" ].forEach( function( connector ) {
            if ( connector[ "flow-node-inventory:state" ][ "link-down" ] ) {
                intermediates.downlinks[ connector.id ] = true;
            }
        } );
    } );

    // save a map of node ids/tp ids to mac address
    // save a map of switch names
    intermediates.macs = {};
    intermediates.names = {};
    intermediates.tables = {};
    inv.nodes.node.forEach( function( node ) {
        node[ "node-connector" ].forEach( function( connector ) {
            if ( connector.id.indexOf( "LOCAL" ) >= 0 ) {
                intermediates.macs[ node.id ] = connector[ "flow-node-inventory:hardware-address" ];
                intermediates.names[ node.id ] = connector[ "flow-node-inventory:name" ];
                intermediates.tables[ node.id ] = getFlowTableById(node[ 'flow-node-inventory:table' ], 0);
            } else {
                intermediates.macs[ connector.id ] = connector[ "flow-node-inventory:hardware-address" ];
            }
        } );
    } );

    var topology = rawTopo[ "network-topology" ].topology[0];

    // push nodes
    out.nodes = [];
    var seenNode = {};

    // push switches to out.nodes
    if ( topology.node ) {
        topology.node.forEach( function( n, i ) {
            var node = {
                'name': intermediates.names[ n[ "node-id" ] ],
                'mac': intermediates.macs[ n[ "node-id" ] ],
                'table': intermediates.tables[ n[ "node-id" ] ],
                'iconType': 'switch'
            };
            if ( !seenNode[ node.name ] ) {
                seenNode[ node.name ] = true;
                out.nodes.push( node );
            }
        } );
    }

    // push links
    out.links = [];
    var seenPort = {};
    var seenLink = {};

    if ( topology.link ) {
        topology.link.forEach( function( l ) {
            // prune redundant links
            if ( !intermediates.downlinks[ l[ "link-id" ] ] && !seenPort[ l.source[ "source-tp" ] ] && !seenPort[ l.destination[ "dest-tp" ] ] ) {
                var link = {
                    'id': l[ "link-id" ],
                    'source': intermediates.names[ l.source[ "source-node" ] ],
                    'target': intermediates.names[ l.destination[ "dest-node" ] ],
                    'source-port': extractPort( l.source[ "source-tp" ] ),
                    'target-port': extractPort( l.destination[ "dest-tp" ] ),
                    'metric': ""
                };
                seenPort[ l.source[ "source-tp" ] ] = true;
                seenPort[ l.destination[ "dest-tp" ] ] = true;
                out.links.push( link );
            }
            seenLink[ l[ "link-id" ] ] = true;
        } );
    }

    return out;
}

function extractSwitchNo( switchname ) {
    return parseInt( switchname.slice( switchname.indexOf( ":" ) + 1 ) );
}

function extractPort( tpname ) {
    return parseInt( tpname.slice( tpname.lastIndexOf( ":" ) + 1 ) );
}

function getFlowTableById( tables, id ) {
    flows = [];

    if ( tables ) {
        target_table = tables.find( function(t) {
            return t.id == id;
        } );

        if ( target_table ) {
            target_table.flow.forEach( function ( f, i ) {
                var flow = {
                    'id': f.id,
                    'priority': f.priority,
                    'match': f.match,
                    'action': f.instructions.instruction
                };
                flows.push( flow );
            } );
        }
    }

    return flows;
}
