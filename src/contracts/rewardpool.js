import web3 from './web3';
import RewardPool from '../abi/RewardPool.json';

require("dotenv").config();

const rewardPool = process.env.NETWORK === "mainnet" ? process.env.REWARDPOOL_MAINNET: process.env.REWARDPOOL_TESTNET;

const instance = new web3.eth.Contract(
  JSON.parse(RewardPool.interface),
  rewardPool
);

export default instance;