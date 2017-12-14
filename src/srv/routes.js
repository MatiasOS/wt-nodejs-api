const Web3 = require('web3')
const express = require('express')
const router = express.Router()
const CONFIG = require('../../config.json')
const { loadAccount, updateAccountPassword } = require('../helpers/crypto')
const { validatePasswords, validatePassword } = require('../helpers/validators')

const BookingData = require('../../libs/BookingData.js')
const HotelManager = require('../../libs/HotelManager.js')
const HotelEvents = require('../../libs/HotelEvents.js')
const User = require('../../libs/User.js')
const Utils = require('../../libs/Utils.js')

const web3 = new Web3(new Web3.providers.HttpProvider(CONFIG.web3Provider))

router.get('/', (req, res) => {
  res.write('WT Nodejs API')
  res.end()
})

router.post('/password', validatePasswords, (req, res, next) => {
  const { password, newPassword } = req.body
  try {
    updateAccountPassword(password, newPassword, loadAccount(CONFIG.privateKeyDir))
  } catch (err) {
    return next({code: 'web3', err})
  }
  res.sendStatus(200)
})

router.get('/hotels', validatePassword, async (req, res, next) => {
  const { password } = req.body
  let ownerAccount = {}
  try {
    ownerAccount = web3.eth.accounts.decrypt(loadAccount(CONFIG.privateKeyDir), password)
  } catch (err) {
    return next({code: 'web3', err})
  }
  try {
    const hotelManager = new HotelManager({
      indexAddress: CONFIG.indexAddress,
      owner: ownerAccount.address,
      gasMargin: CONFIG.gasMargin,
      web3: web3
    })
    const hotels = await hotelManager.getHotels()
    res.status(200).json(hotels)
  } catch (err) {
    return next({code: 'hotelManager', err})
  }
})

module.exports = {
  router
}