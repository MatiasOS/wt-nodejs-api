const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.write('WT Nodejs API');
  res.end();
})

module.exports = {
  router : router
}
