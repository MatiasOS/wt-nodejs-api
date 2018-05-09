const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const config = require('../src/config');
const WTIndexContract = require('@windingtree/wt-contracts/build/contracts/WTIndex');
const LifContract = require('@windingtree/wt-contracts/build/contracts/WTIndex');

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

const provider = new Web3.providers.HttpProvider(config.get('web3Provider'));
const web3 = new Web3(provider);

const deploy = async (contract, label) => {
  const accounts = await web3.eth.getAccounts();
  const deployed = await contract.new({
    from: accounts[0],
    gas: 6000000,
  });
  config.set(label, deployed.address);
  console.log(`${label} address`, deployed.address);
};

deploy(getContractWithProvider(WTIndexContract, provider), 'WTIndex');
deploy(getContractWithProvider(LifContract, provider), 'Lif');

module.exports = {
  deploy,
};
