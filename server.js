import express from 'express'
import fs from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'
import * as dotenv from 'dotenv'

dotenv.config()

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const app = express()

const startServer = async (options) => {
    if(!options.port) {
        console.error('Port is required')
        return;
    }

    if(!options.origin) {
        console.error('Origin is required')
        return;
    }

    app.use(async (req, res) => {
        const requestPath = req.path;
        console.log("Incoming request:", requestPath);
        res.status(200).send({
            "message": "working!!!"
        });
    });

    app.listen(options.port, () => {
        console.log(`Server is running on port ${options.port}`)
    })

}

export default startServer