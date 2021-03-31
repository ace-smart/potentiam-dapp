import React from 'react';
import { Button, Form, Input, Statistic, Table } from 'semantic-ui-react';
import { useEffect, useState, useCallback } from 'react';
import address from '../abi/address.json';
import web3 from '../contracts/web3';
import ptm from '../contracts/ptm';
import vault from '../contracts/vault';
import controller from '../contracts/controller';
import rewardpool from '../contracts/rewardpool';
import systempool from '../contracts/systempool';

export default () => {
    const [account, setAccount] = useState('');
    const [pending, setPending] = useState(false);
    const [walletBalance, setWalletBallance] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [depositAmount, setDepositAmount] = useState(0);
    const [users, setUsers] = useState([]);
    const [balanceOfSystemPool, setBalanceOfSystemPool] = useState(0);
    const [balanceOfRewardPool, setBalanceOfRewardPool] = useState(0);
    const [systemPool, setSystemPool] = useState('');
    const [rewardPool, setRewardPool] = useState('');
    const [vaultRewards, setVaultRewards] = useState(0);
    const [creatorsRewards, setCreatorsRewards] = useState(0);
    const [devRewards, setDevRewards] = useState(0);
    const [balanceOfVault, setVaultBalance] = useState(0);
    const [vaultTotalRewards, setVaultTotalRewards] = useState(0);
    const [devWallet, setDevWallet] = useState(0);
    const [creatorAddress, setCreatorAddress] = useState('');
    const [creatorPower, setCreatorPower] = useState(0);

    const toEther = (val) => {
        if (!val) return 0;
        return Number(web3.utils.fromWei(val).toString()).toFixed(4);
    }

    const toWei = (val) => {
        return web3.utils.toWei(val);
    }

    const deposit = async () => {
        if (!depositAmount) {
            console.error("Invalid amount to withdraw");
            return;
        }
        const amount = toWei(depositAmount);
        console.log(amount);
        try {
            setPending(true);
            await ptm.methods.transfer(systemPool, amount).send({from: account});
            setPending(false);
            updatePage();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const withdraw = async () => {
        if (!withdrawAmount) {
            console.error("Invalid amount to withdraw");
            return;
        }
        const amount = toWei(withdrawAmount);
        try {
            setPending(true);
            await systempool(systemPool).methods.withdraw(amount).send({from: account});
            setPending(false);
            updatePage();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const withdrawFromDev = async () => {
        try {
            setPending(true);
            await rewardpool(rewardPool).methods.withdrawFromDev().send({from: account});
            setPending(false);
            updatePage();
            updateRewardPool();
        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const withdrawFromCreator = async () => {
        try {
            setPending(true);
            await rewardpool(rewardPool).methods.withdrawFromCreator().send({from: account});
            setPending(false);
            updatePage();
            updateRewardPool();
        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const startClaim = async () => {
        try {
            setPending(true);
            await controller.methods.startDistributeRewards().send({from: account});
            setPending(false);
            updatePage();
            updateRewardPool();
        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const stopClaim = async () => {
        try {
            setPending(true);
            await controller.methods.stopDistributeRewards().send({from: account});
            setPending(false);
            updatePage();
            updateRewardPool();
        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const addCreator =  async () => {
        if (!creatorAddress || !creatorPower) {
            console.error("Invalid creator address or power");
            return;
        }
        const balance = toWei(creatorPower);
        try {
            setPending(true);
            await rewardpool(rewardPool).methods.addOrUpdateCreator(creatorAddress, balance).send({from: account});
            setPending(false);
            updateRewardPool();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const removeCreator =  async (creator) => {
        if (!creator) {
            console.error("Invalid creator address");
            return;
        }
        try {
            setPending(true);
            await rewardpool(rewardPool).methods.removeCreator(creator).send({from: account});
            setPending(false);
            updateRewardPool();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const updateWithdrawAmount = (event) => {
        setWithdrawAmount(event.target.value);
    }

    const updateDepositAmount = (event) => {
        setDepositAmount(event.target.value);
    }

    const updateCreatorAddress = (event) => {
        setCreatorAddress(event.target.value);
    }

    const updateCreatorPower = (event) => {
        setCreatorPower(event.target.value);
    }

    const powerOfCreator = async (creator) => {
        return (await rewardpool(rewardPool).methods.powerOfCreator(creator).call());
    }

    const rewardOfCreator = async (creator) => {
        return (await rewardpool(rewardPool).methods.rewardOfCreator(creator).call());
    }

    const updateRewardPool = useCallback(() => {
        if (rewardPool === '') return;

        rewardpool(rewardPool).methods.balance().call().then(balance => {
            setBalanceOfRewardPool(balance);
        });

        rewardpool(rewardPool).methods.balanceOfVault().call().then(balance => {
            setVaultRewards(balance);
        })

        rewardpool(rewardPool).methods.balanceOfCreator().call().then(balance => {
            setCreatorsRewards(balance);
        })

        rewardpool(rewardPool).methods.balanceOfDev().call().then(balance => {
            setDevRewards(balance);
        })

        rewardpool(rewardPool).methods.devWallet().call().then(address => {
            setDevWallet(address);
        })

        vault.methods.totalRewards().call().then(balance => {
            setVaultTotalRewards(balance);
        });

        rewardpool(rewardPool).methods.creatorList().call({from: account}).then(async addresses => {
            const promises = addresses.map(async addr => {
                return {
                    address: addr,
                    power: (await powerOfCreator(addr)),
                    balance: (await rewardOfCreator(addr)),
                }
            });
            
            const userList = await Promise.all(promises);
            setUsers(userList);
        })

    }, [rewardPool])

    const updatePage = useCallback(() => {
        if (!account) return;

        ptm.methods.balanceOf(account).call().then(balance => {
            setWalletBallance(balance);
        })

        controller.methods.systemPool().call().then(address => {
            setSystemPool(address);
        });

        controller.methods.rewardPool().call().then(address => {
            setRewardPool(address);
        });

        vault.methods.balance().call().then(balance => {
            setVaultBalance(balance);
        });

    }, [account])

    useEffect(() => {
        updateRewardPool();
    }, [rewardPool, updateRewardPool]);

    useEffect(() => {
        if (systemPool === '') return;

        systempool(systemPool).methods.balance().call().then(balance => {
            setBalanceOfSystemPool(balance);
        });
    }, [systemPool, walletBalance]);
    
    useEffect(() => {
        web3.eth.getAccounts().then(addr => {
            setAccount(addr[0]);
        });
    }, []);

    useEffect(() => {
        if (!account) return;
        updatePage();
    }, [account, updatePage]);

  return (
    <div>
        <h1>Controller</h1>
        <Statistic.Group size='small'>
            <Statistic label='Metamask Balance (PTM)' size='small' value={toEther(walletBalance)} />
            <Statistic label='System Pool (PTM)' size='small' value={toEther(balanceOfSystemPool)} />
        </Statistic.Group>
        <br></br>
        <Form loading={pending}>
            <br></br>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount to deposit' type='number' onChange={updateDepositAmount} />
                <Form.Button content="Deposit" primary style={{width:'105px'}} onClick={deposit} />
            </Form.Group>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount to withdraw' type='number' onChange={updateWithdrawAmount} />
                <Form.Button content="Withdraw" primary style={{width:'105px'}} onClick={withdraw} />
            </Form.Group>
        </Form>
        <br></br>

        <Statistic.Group size='small'>
            <Statistic label='Reward Pool (PTM)' size='small' value={toEther(balanceOfRewardPool)} />
            <Statistic label='Vault (50%)' size='small' value={toEther(vaultRewards)} />
            <Statistic label='Creators (30%)' size='small' value={toEther(creatorsRewards)} />
            <Statistic label='Dev Team (20%)' size='small' value={toEther(devRewards)} />
        </Statistic.Group>
        <br></br>
        <Form loading={pending}>
            <Form.Group withs={2}>
                <Button content="Start Claim" primary onClick={startClaim} />
                <Button content="End Claim" color='red' onClick={stopClaim} />
            </Form.Group>
            <Form.Group>
                <Form.Field inline>
                    <Button content="Claim from Dev" primary style={{width:'165px'}} onClick={withdrawFromDev} />
                    <label>{devWallet}</label>
                </Form.Field>
            </Form.Group>
            <Form.Group>
                <Form.Field inline>
                    <Button content="Claim from Creator" primary style={{width:'165px'}} onClick={withdrawFromCreator} />
                    <label>{account}</label>
                </Form.Field>
            </Form.Group>
        </Form>
        <br></br>

        <h2>Backend Role</h2>

        <br></br>
        <Form loading={pending}>
            <Form.Group width={2}>
                <Form.Field inline>
                    <label>Add creator</label>
                    <Input placeholder='Creator Address' style={{width:"370px"}} onChange={updateCreatorAddress} />
                    <Input placeholder='Power' type='number' onChange={updateCreatorPower} />
                </Form.Field>
                <Button content="Add" primary onClick={addCreator} />
            </Form.Group>
        
            <br></br>
            
            <h3>Creator List</h3>
            <Table striped>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Creator</Table.HeaderCell>
                    <Table.HeaderCell>Power</Table.HeaderCell>
                    <Table.HeaderCell>Reward</Table.HeaderCell>
                    <Table.HeaderCell>Remove</Table.HeaderCell>
                </Table.Row>
                </Table.Header>

                <Table.Body key='shared-users'>
                {users.map(user => {
                    return (
                        <Table.Row>
                            <Table.Cell>{user.address}</Table.Cell>
                            <Table.Cell>{toEther(user.power)}</Table.Cell>
                            <Table.Cell>{toEther(user.balance)}</Table.Cell>
                            <Table.Cell>
                                <Button content='Remove' color='red' onClick={() => removeCreator(user.address)} />
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>

        </Form>

        <br></br>
    </div>
  );
};
