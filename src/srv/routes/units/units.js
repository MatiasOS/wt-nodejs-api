const express = require('express');
const unitsRouter = express.Router();
const config = require('../../../../config.js');
const { loadAccount } = require('../../../helpers/crypto');
const { validatePassword,
  validateActive,
  validateDate,
  validateDateRange } = require('../../../helpers/validators');

const { handle } = require('../../../../errors');
const { HotelManager, BookingData, User } = require('@windingtree/wt-js-libs');

unitsRouter.post('/hotels/:hotelAddress/unitTypes/:unitType/units', validatePassword, async (req, res, next) => {
  const { password } = req.body;
  const { hotelAddress, unitType } = req.params;
  let ownerAccount = {};
  try {
    let context = {
      indexAddress: config.get('indexAddress'),
      gasMargin: config.get('gasMargin'),
      web3provider: config.get('web3provider'),
    };
    ownerAccount = config.get('web3provider').web3.eth.accounts.decrypt(loadAccount(config.get('privateKeyDir')), password);
    context.owner = ownerAccount.address;
    const hotelManager = new HotelManager(context);
    config.get('web3provider').web3.eth.accounts.wallet.add(ownerAccount);
    const { logs } = await hotelManager.addUnit(hotelAddress, unitType);
    config.get('web3provider').web3.eth.accounts.wallet.remove(ownerAccount);
    res.status(200).json({
      txHash: logs[0].transactionHash,
    });
  } catch (err) {
    next(handle('web3', err));
  }
});

unitsRouter.delete([
  '/hotels/:hotelAddress/unitTypes/:unitType/units/:unitAddress',
  '/hotels/:hotelAddress/units/:unitAddress',
], validatePassword,
async (req, res, next) => {
  const { password } = req.body;
  const { hotelAddress, unitAddress } = req.params;
  let ownerAccount = {};
  try {
    let context = {
      indexAddress: config.get('indexAddress'),
      gasMargin: config.get('gasMargin'),
      web3provider: config.get('web3provider'),
    };
    ownerAccount = config.get('web3provider').web3.eth.accounts.decrypt(loadAccount(config.get('privateKeyDir')), password);
    context.owner = ownerAccount.address;
    const hotelManager = new HotelManager(context);
    config.get('web3provider').web3.eth.accounts.wallet.add(ownerAccount);
    const { logs } = await hotelManager.removeUnit(hotelAddress, unitAddress);
    config.get('web3provider').web3.eth.accounts.wallet.remove(ownerAccount);
    res.status(200).json({
      txHash: logs[0].transactionHash,
    });
  } catch (err) {
    next(handle('web3', err));
  }
});

unitsRouter.put([
  '/hotels/:hotelAddress/unitTypes/:unitType/units/:unitAddress/active',
  '/hotels/:hotelAddress/units/:unitAddress/active',
], validatePassword, validateActive,
async (req, res, next) => {
  const { password, active } = req.body;
  const { hotelAddress, unitAddress } = req.params;
  let ownerAccount = {};
  try {
    let context = {
      indexAddress: config.get('indexAddress'),
      gasMargin: config.get('gasMargin'),
      web3provider: config.get('web3provider'),
    };
    ownerAccount = config.get('web3provider').eth.accounts.decrypt(loadAccount(config.get('privateKeyDir'), password));
    context.owner = ownerAccount.address;
    const hotelManager = new HotelManager(context);
    config.get('web3provider').web3.eth.accounts.wallet.add(ownerAccount);
    const { logs } = await hotelManager.setUnitActive(hotelAddress, unitAddress, active);
    config.get('web3provider').web3.eth.accounts.wallet.remove(ownerAccount);
    res.status(200).json({
      txHash: logs[0].transactionHash,
    });
  } catch (err) {
    next(handle('web3', err));
  }
});

unitsRouter.get('/units/:unitAddress/reservation', validateDate, async (req, res, next) => {
  const { date } = req.body;
  const { unitAddress } = req.params;
  try {
    let context = {
      indexAddress: config.get('indexAddress'),
      gasMargin: config.get('gasMargin'),
      web3provider: config.get('web3provider'),
    };
    const hotelManager = new HotelManager(context);
    const reservation = await hotelManager.getReservation(unitAddress, date);
    res.status(200).json({
      reservation,
    });
  } catch (err) {
    next(handle('web3', err));
  }
});

unitsRouter.get('/hotels/:hotelAddress/units/:unitAddress/available', validateDateRange, async (req, res, next) => {
  const { from, days } = req.body;
  const { hotelAddress, unitAddress } = req.params;
  try {
    const data = new BookingData({ web3provider: config.get('web3provider') });
    const fromDate = new Date(from);
    const available = await data.unitIsAvailable(hotelAddress, unitAddress, fromDate, days);
    res.status(200).json({ available });
  } catch (err) {
    next(handle('web3', err));
  }
});

unitsRouter.post('/hotels/:hotelAddress/units/:unitAddress/book',
  validateDateRange, async (req, res, next) => {
    const { guest, from, days, account } = req.body;
    const { hotelAddress, unitAddress } = req.params;
    try {
      const user = new User({
        account,
        gasMargin: config.get('gasMargin'),
        tokenAddress: config.get('tokenAddress'),
        web3provider: config.get('web3provider'),
      });
      const fromDate = new Date(from);
      const { transactionHash } = await user.book(hotelAddress, unitAddress, fromDate, days, guest);
      res.status(200).json({
        txHash: transactionHash,
      });
    } catch (err) {
      next(handle('web3', err));
    }
  });

unitsRouter.post('/hotels/:hotelAddress/units/:unitAddress/lifBook',
  validateDateRange, async (req, res, next) => {
    const { guest, from, days, account } = req.body;
    const { hotelAddress, unitAddress } = req.params;
    try {
      const user = new User({
        account,
        gasMargin: config.get('gasMargin'),
        tokenAddress: config.get('tokenAddress'),
        web3provider: config.get('web3provider'),
      });
      const fromDate = new Date(from);
      const { transactionHash } = await user.bookWithLif(hotelAddress, unitAddress, fromDate, days, guest);
      res.status(200).json({
        txHash: transactionHash,
      });
    } catch (err) {
      next(handle('web3', err));
    }
  });

module.exports = {
  unitsRouter,
};
