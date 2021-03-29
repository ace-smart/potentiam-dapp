import web3 from './web3';
import Node from '../abi/VaultNode.sol/VaultNode.json';

require("dotenv").config();

const ptm = process.env.NETWORK === "mainnet" ? process.env.PTM_MAIN: process.env.PTM_TESTNET;

const instance = (address) => {
    return (new web3.eth.Contract(
        Node.abi,
        address
      ));
}

export default instance;