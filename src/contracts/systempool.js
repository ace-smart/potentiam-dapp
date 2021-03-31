import web3 from './web3';
import SystemPool from '../abi/Controller.sol/SystemPool.json';

const instance = (address) => {
    return (new web3.eth.Contract(
        SystemPool.abi,
        address
      ));
}

export default instance;