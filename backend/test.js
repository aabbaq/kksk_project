const express = require('express')
const rapp = express()

rapp.get('/', (req, res) => {
  res.send('Hello World!')
})

rapp.listen(3001)
