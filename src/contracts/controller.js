import web3 from './web3';
import Controller from '../abi/Controller.sol/Controller.json';

require("dotenv").config();

const controller = process.env.NETWORK === "mainnet" ? process.env.CONTROLLER_MAINNET: process.env.CONTROLLER_TESTNET;

const instance = new web3.eth.Contract(
  Controller.abi,
  controller
);

export default instance;