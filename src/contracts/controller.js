import web3 from './web3';
import Controller from '../abi/Controller.sol/Controller.json';
import address from '../abi/address.json';

const controller = address.network === "mainnet" ? address.mainnet.controller: address.testnet.controller;

const instance = new web3.eth.Contract(
  Controller.abi,
  controller
);

export default instance;