import React from 'react';
import { Button, Form, Input, Statistic, Table } from 'semantic-ui-react';
import { useEffect, useState, useCallback } from 'react';
import address from '../abi/address.json';
import web3 from '../contracts/web3';
import ptm from '../contracts/ptm';
import controller from '../contracts/controller';
import rewardpool from '../contracts/rewardpool';
import systempool from '../contracts/systempool';

export default () => {
    const [account, setAccount] = useState('');
    const [pending, setPending] = useState(false);
    const [walletBalance, setWalletBallance] = useState(0);
    const [fiatBalance, setFiatBalance] = useState(0);
    const [ptmBalance, setPtmBalance] = useState(0);
    const [ptmPrice, setPtmPrice] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [withdrawAmountOfFiat, setWithdrawAmountOfFiat] = useState(0);
    const [users, setUsers] = useState([]);
    const [balanceOfSystemPool, setBalanceOfSystemPool] = useState(0);
    const [balanceOfRewardPool, setBalanceOfRewardPool] = useState(0);
    const [systemPool, setSystemPool] = useState('');
    const [rewardPool, setRewardPool] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [userBalance, setUserBalance] = useState('');

    const toEther = (val) => {
        if (!val) return 0;
        return Number(web3.utils.fromWei(val).toString()).toFixed(4);
    }

    const toWei = (val) => {
        return web3.utils.toWei(val);
    }

    const balanceOfPtm = async (address) => {
        const balance = await controller.methods.balanceOf(address).call();
        return balance;
    }

    const balanceOfFiat = async (address) => {
        const balance = await controller.methods.balanceOfFiat(address).call();
        return balance;
    }

    const withdrawFiat = async () => {
        if (!withdrawAmountOfFiat) {
            console.error("Invalid amount to withdraw");
            return;
        }
        const amount = toWei(withdrawAmountOfFiat);
        try {
            setPending(true);
            await controller.methods.withdrawFiat(amount).send({from: account});
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
        const amount = toWei((toEther(ptmPrice)*withdrawAmount).toString());
        try {
            setPending(true);
            await controller.methods.withdraw(amount).send({from: account});
            setPending(false);
            updatePage();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const claim = () => {

    }

    const updateUser =  async () => {
        if (!userAddress || !userBalance) {
            console.error("Invalid user address or balance");
            return;
        }
        const balance = toWei(userBalance);
        try {
            setPending(true);
            await controller.methods.updateWalletBalance(userAddress, balance).send({from: account});
            setPending(false);
            updatePage();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const updateWithdrawAmount = (event) => {
        setWithdrawAmount(event.target.value);
    }

    const updateWithdrawAmountOfFiat = (event) => {
        setWithdrawAmountOfFiat(event.target.value);
    }

    const updateUserAddress = (event) => {
        setUserAddress(event.target.value);
    }

    const updateUserBalance = (event) => {
        setUserBalance(event.target.value);
    }

    useEffect(() => {
        if (systemPool === '') return;

        systempool(systemPool).methods.balance().call().then(balance => {
            setBalanceOfSystemPool(balance);
        });
    }, [systemPool, fiatBalance, ptmBalance]);

    useEffect(() => {
        if (rewardPool === '') return;

        rewardpool(rewardPool).methods.balance().call().then(balance => {
            setBalanceOfRewardPool(balance);
        });
    }, [rewardPool, fiatBalance, ptmBalance]);

    const updatePage = useCallback(() => {
        if (!account) return;

        ptm.methods.balanceOf(account).call().then(balance => {
            setWalletBallance(balance);
        })

        controller.methods.ptmPrice().call().then(price => {
            setPtmPrice(price);
        });

        controller.methods.balanceOfFiat(account).call().then(balance => {
            setFiatBalance(balance);
        });

        controller.methods.balanceOf(account).call().then(balance => {
            setPtmBalance(balance);
        });

        controller.methods.systemPool().call().then(address => {
            setSystemPool(address);
        });

        controller.methods.rewardPool().call().then(address => {
            setRewardPool(address);
        });

        controller.methods.userList().call({from: account}).then(async addresses => {
            const promises = addresses.map(async addr => {
                return {
                    address: addr,
                    balance: (await balanceOfPtm(addr)),
                    fiat: (await balanceOfFiat(addr)),
                }
            });
            
            const userList = await Promise.all(promises);
            setUsers(userList);
        })
    }, [account])
    
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
        <h1>Transaction Manager</h1>
        <Statistic.Group size='small'>
            <Statistic label='Metamask Balance (PTM)' size='small' value={toEther(walletBalance)} />
            <Statistic label='Current Fiat Balance' size='small' value={toEther(fiatBalance)}/>
            <Statistic label='Current PTM Balance' size='small' value={toEther(ptmBalance)}/>
            <Statistic label='PTM Price ($)' size='small' value={toEther(ptmPrice)} />
        </Statistic.Group>
        <Form loading={pending}>
            <br></br>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount of Fiat' type='number' onChange={updateWithdrawAmountOfFiat} />
                <Form.Button content="Withdraw Fiat" primary style={{width:'140px'}} onClick={withdrawFiat} />
                <label>30% fee</label>
            </Form.Group>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount of PTM' type='number' onChange={updateWithdrawAmount} />
                <Form.Button content="Withdraw PTM" primary style={{width:'140px'}} onClick={withdraw} />
                <label>20% fee</label>
            </Form.Group>
        </Form>

        <h2>Administrator Role</h2>
        <Statistic.Group size='small'>
            <Statistic label='System Pool (PTM)' size='small' value={toEther(balanceOfSystemPool)} />
            <Statistic label='Reward Pool (PTM)' size='small' value={toEther(balanceOfRewardPool)} />
        </Statistic.Group>
        <br></br>
        

        <h3>User Wallet List</h3>
        <Table striped>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>User</Table.HeaderCell>
                <Table.HeaderCell>Balance (Fiat)</Table.HeaderCell>
                <Table.HeaderCell>Balance (PTM)</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body key='shared-users'>
            {users.map(user => {
                return (
                    <Table.Row>
                        <Table.Cell>{user.address}</Table.Cell>
                        <Table.Cell>{toEther(user.fiat)}</Table.Cell>
                        <Table.Cell>{toEther(user.balance)}</Table.Cell>
                    </Table.Row>
                )
            })}
            </Table.Body>
        </Table>

        <h2>Backend Role</h2>
        <br></br>
        <Form loading={pending}>
            <Form.Group width={2}>
                <Form.Field inline>
                    <label>Update balance of user wallet</label>
                    <Input placeholder='User Address' style={{width:"370px"}} onChange={updateUserAddress} />
                    <Input placeholder='Balance' type='number' onChange={updateUserBalance} />
                </Form.Field>
                <Button content="Update" primary onClick={updateUser} />
            </Form.Group>
        </Form>
        <br></br>
    </div>
  );
};
