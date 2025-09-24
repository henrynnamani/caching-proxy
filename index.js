#!/usr/bin/env node

import { Command } from 'commander'
import startServer from './server.js'

const program = new Command()

program.version('1.0').description('Cache server proxy')

program.description('Spin up proxy server').requiredOption('-p, --port <port>', 'Port to run server on').requiredOption('-o, --origin <origin>', 'Origin server to which requests will be forwarded to').action((options) => {
    const port = parseInt(options.port)

    if(isNaN(port) || port < 1 || port > 65535) {
        console.error('Port is invalid')
        return;
    }

    try {
        new URL(options.origin)
    } catch(err) {
        console.error('Invalid origin URL')
        return;
    }

    startServer(options)
})

program.parse(process.argv)