import web3 from './web3';
import Vault from '../abi/Vault.sol/Vault.json';
import address from '../abi/address.json';

require("dotenv").config();

const vault = address.network === "mainnet" ? address.mainnet.vault: address.testnet.vault;

const instance = new web3.eth.Contract(
  Vault.abi,
  vault
);

export default instance;