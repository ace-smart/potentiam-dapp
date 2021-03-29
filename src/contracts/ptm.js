import web3 from './web3';
import PTM from '../abi/PTM.sol/PTM.json';
import address from '../abi/address.json';

const ptm = address.network === "mainnet" ? address.mainnet.ptm: address.testnet.ptm;

const instance = new web3.eth.Contract(
  PTM.abi,
  ptm
);

export default instance;