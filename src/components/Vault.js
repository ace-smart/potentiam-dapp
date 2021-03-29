import React from 'react';
import { Button, Form, Statistic, Table } from 'semantic-ui-react';
import { useEffect, useState, useCallback } from 'react';
import address from '../abi/address.json';
import web3 from '../contracts/web3';
import ptm from '../contracts/ptm';
import vault from '../contracts/vault';
import vaultNode from '../contracts/node';

export default () => {
    const [totalBalance, setTotalBalance] = useState(0);
    const [sharedBalance, setSharedBalance] = useState(0);
    const [myBalance, setMyBalance] = useState(0);
    const [walletBalance, setWalletBallance] = useState(0);
    const [account, setAccount] = useState('');
    const [nodes, setNodes] = useState([]);
    const [myNodes, setMyNodes] = useState([]);
    const [sharedUsers, setSharedUsers] = useState([]);
    const [rewards, setRewards] = useState(0);
    const [stakeAmount, setStakeAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [claimAmount, setClaimAmount] = useState(0);
    const [pending, setPending] = useState(false);

    const toEther = (val) => {
        if (!val) return 0;
        return Number(web3.utils.fromWei(val).toString()).toFixed(4);
    }

    const toWei = (val) => {
        return web3.utils.toWei(val);
    }

    const balanceOfNode = async (address) => {
        const balance = await vaultNode(address).methods.balance().call();
        return balance;
    }

    const balanceOfUser = async (address) => {
        const balance = await vault.methods.balanceOf(address).call();
        return balance;
    }

    const isActiveNode = async (address) => {
        const active = await vaultNode(address).methods.active().call();
        return active;
    }

    const nodeOwner = async (address) => {
        const active = await vaultNode(address).methods.owner().call();
        return active;
    }

    const stake = async () => {
        if (!stakeAmount) {
            console.log("Invalid amount to stake");
            return;
        }
        const amount = toWei(stakeAmount);
        try {
            setPending(true);
            await ptm.methods.approve(vault._address, amount).send({from: account});
            await vault.methods.stake(amount).send({from: account});
            setPending(false);
            updateVaultInfo();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const withdraw = async () => {
        if (!withdrawAmount) {
            console.log("Invalid amount to withdraw");
            return;
        }
        const amount = toWei(withdrawAmount);
        try {
            setPending(true);
            await vault.methods.withdraw(amount).send({from: account});
            setPending(false);
            updateVaultInfo();

        } catch (error) {
            console.error(error.message);
            setPending(false);
        }
    }

    const claim = () => {

    }

    const updateStakeAmount = (event) => {
        setStakeAmount(event.target.value);
    }

    const updateWithdrawAmount = (event) => {
        setWithdrawAmount(event.target.value);
    }

    const updateClaimAmount = (event) => {
        setClaimAmount(event.target.value);
    }

    const updateVaultInfo = useCallback(() => {
        if (!account) return;

        vault.methods.totalBalance().call().then(balance => {
            setTotalBalance(balance);
        });

        // vault.methods.sharedBalance().call().then(balance => {
        //     setSharedBalance(balance);
        // });

        vault.methods.balanceOf(account).call().then(balance => {
            setMyBalance(balance);
        });

        vault.methods.rewardsOf(account).call().then(balance => {
            setRewards(balance);
        });

        ptm.methods.balanceOf(account).call().then(balance => {
            setWalletBallance(balance);
        })

        vault.methods.nodeListAll().call({from: account}).then(async addresses => {
            const promises = addresses.map(async addr => {
                return {
                    address: addr,
                    owner: (await nodeOwner(addr)),
                    balance: (await balanceOfNode(addr)),
                    isActive: (await isActiveNode(addr)),
                }
            });
            
            const nodeList = await Promise.all(promises);
            const myNodes = nodeList.filter(node => node.owner === account);
            setNodes(nodeList);
            setMyNodes(myNodes);
        })

        // vault.methods.sharedUsers().call().then(async addresses => {
        //     const promises = addresses.map(async addr => {
        //         return {
        //             user: addr,
        //             balance: (await balanceOfUser(addr)),
        //         }
        //     });
            
        //     const users = await Promise.all(promises);
        //     setSharedUsers(users);
        // })
    }, [account])
    
    useEffect(() => {
        web3.eth.getAccounts().then(addr => {
            setAccount(addr[0]);
        });
    }, []);

    useEffect(() => {
        if (!account) return;
        updateVaultInfo();
    }, [account, updateVaultInfo]);

  return (
    <div>
        <h1>Vault Manager</h1>
        <Form loading={pending}>
            <Statistic.Group size='small'>
                <Statistic label='Current Balance (PTM)' size='small' value={toEther(myBalance)} />
                <Statistic label='Wallet Balance (PTM)' size='small' value={toEther(walletBalance)} />
            </Statistic.Group>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount to stake' type='number' onChange={updateStakeAmount} />
                <Form.Button content="Stake" primary style={{width:'105px'}} onClick={stake} />
            </Form.Group>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount to withdraw' type='number' onChange={updateWithdrawAmount} />
                <Form.Button content="Withdraw" primary style={{width:'105px'}} onClick={withdraw} />
            </Form.Group>
            <Statistic.Group size='small'>
                <Statistic label='Current Rewards (PTM)' size='small' value={toEther(rewards)} />
            </Statistic.Group>
            <Form.Group withs={2}>
                <Form.Input placeholder='Amount to claim' type='number' onChange={updateClaimAmount} />
                <Form.Button content="Claim" primary style={{width:'105px'}} onClick={claim} />
            </Form.Group>
        </Form>

        <h3>My Nodes</h3>

        <Table striped>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Node</Table.HeaderCell>
                <Table.HeaderCell>Balance</Table.HeaderCell>
                <Table.HeaderCell>Is Active</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body key='user-nodes'>
            {myNodes.map(node => {
                return (
                    <Table.Row>
                        <Table.Cell>{node.address}</Table.Cell>
                        <Table.Cell>{toEther(node.balance)}</Table.Cell>
                        <Table.Cell>{node.isActive ? 'active' : ''}</Table.Cell>
                    </Table.Row>
                )
            })}
            </Table.Body>
        </Table>

        <h2>Administrator Role</h2>
        <Statistic.Group size='small'>
            <Statistic label='Total Balance (PTM)' size='small' value={toEther(totalBalance)} />
        </Statistic.Group>

        <h3>All Nodes</h3>

        <Table striped>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Owner</Table.HeaderCell>
                <Table.HeaderCell>Node</Table.HeaderCell>
                <Table.HeaderCell>Balance</Table.HeaderCell>
                <Table.HeaderCell>Is Active</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body key='admin-nodes'>
            {nodes.map(node => {
                return (
                    <Table.Row>
                        <Table.Cell>{node.owner}</Table.Cell>
                        <Table.Cell>{node.address}</Table.Cell>
                        <Table.Cell>{toEther(node.balance)}</Table.Cell>
                        <Table.Cell>{node.isActive ? 'active' : ''}</Table.Cell>
                    </Table.Row>
                )
            })}
            </Table.Body>
        </Table>

        <Statistic.Group size='small'>
            <Statistic label='Shared Balance (PTM)' size='small' value={toEther(sharedBalance)} />
        </Statistic.Group>

        <h3>Shared Users</h3>
        <Table striped>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>User</Table.HeaderCell>
                <Table.HeaderCell>Balance</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body key='shared-users'>
            {sharedUsers.map(user => {
                return (
                    <Table.Row>
                        <Table.Cell>{user.address}</Table.Cell>
                        <Table.Cell>{toEther(user.balance)}</Table.Cell>
                    </Table.Row>
                )
            })}
            </Table.Body>
        </Table>
    </div>
  );
};
