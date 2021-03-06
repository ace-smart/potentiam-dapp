import web3 from './web3';
import RewardPool from '../abi/Controller.sol/RewardPool.json';

const instance = (address) => {
    return (new web3.eth.Contract(
        RewardPool.abi,
        address
      ));
}

export default instance;