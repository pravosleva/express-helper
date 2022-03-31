const express = require('express')

const urlMetadata = express()
const editorjsRoute = require('./mws/editorjs')

urlMetadata.get('/editorjs', editorjsRoute)

module.exports = urlMetadata
