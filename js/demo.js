// Initialize a topology component

nx.define('DemoNodeTooltip', nx.ui.Component, {
    properties: {
        node: {}
    },
    view: {
        content: [
            {
                tag: 'h1',
                content: '{#node.model.name}'
            },
            {
                tag: 'p',
                content: [
                    {
                        tag: 'label',
                        props: {
                            style: 'margin-right: 5px;'
                        },
                        content: 'MAC:'
                    },
                    {
                        tag: 'span',
                        content: '{#node.model.mac}'
                    }]
            },
            {
                tag: "table",
                props: {
                    class: "col-md-12",
                    border: "1"
                },
                content: [
                    {
                        tag: "thead",
                        content: [
                            {
                                tag: "td",
                                content: "flow-id"
                            },
                            {
                                tag: "td",
                                content: "priority"
                            },
                            {
                                tag: "td",
                                content: "match"
                            },
                            {
                                tag: "td",
                                content: "action"
                            }
                        ]
                    },
                    {
                        tag: "tbody",
                        props: {
                            items: "{#node.model.table}",
                            template: {
                                tag: "tr",
                                content: [
                                    {
                                        tag: "td",
                                        content: "{id}"
                                    },
                                    {
                                        tag: "td",
                                        content: "{priority}"
                                    },
                                    {
                                        tag: "td",
                                        content: "{match}"
                                    },
                                    {
                                        tag: "td",
                                        content: "{action}"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }
});

var topo = new nx.graphic.Topology({
    width: 640,
    height: 640,
    nodeConfig: {
        label: 'model.name',
        iconType: 'model.iconType'
    },
    linkConfig: {
        linkType: 'curve',
        iconType: 'model.iconType'
    },
    tooltipManagerConfig: {
        nodeTooltipContentClass: 'DemoNodeTooltip'
    },
    showIcon: true,
    identityKey: 'name',
    autoLayout: true,
    dataProcessor: 'force'
});
