const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const config = require('../config');
const WTIndexContract = require('@windingtree/wt-contracts/build/contracts/WTIndex');

const provider = new Web3.providers.HttpProvider(config.get('web3Provider'));
const web3 = new Web3(provider);

// dirty hack for web3@1.0.0 support for localhost testrpc, see
// https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
const hackInSendAsync = (instance) => {
  if (typeof instance.currentProvider.sendAsync !== 'function') {
    instance.currentProvider.sendAsync = function () {
      return instance.currentProvider.send.apply(
        instance.currentProvider, arguments
      );
    };
  }
  return instance;
};

const getContractWithProvider = (metadata, provider) => {
  let contract = new TruffleContract(metadata);
  contract.setProvider(provider);
  contract = hackInSendAsync(contract);
  return contract;
};

const deployIndex = async () => {
  const indexContract = getContractWithProvider(WTIndexContract, provider);
  const accounts = await web3.eth.getAccounts();
  const { address } = await indexContract.new({
    from: accounts[0],
    gas: 6000000,
  });
  config.set('indexAddress', address);
  console.log(`WTIndex at ${address}!`);
};

module.exports = {
  deployIndex,
};
