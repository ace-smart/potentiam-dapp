import web3 from './web3';
import Node from '../abi/VaultNode.sol/VaultNode.json';

const instance = (address) => {
    return (new web3.eth.Contract(
        Node.abi,
        address
      ));
}

export default instance;