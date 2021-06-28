import { useState, useEffect } from 'react'
import './App.css';
//mport infuraUrl from './infura'
import { MaticPOSClient } from '@maticnetwork/maticjs'
import { ethers } from 'ethers'

function App() {
  //const rootTokenAddress = '0x655F2166b0709cd575202630952D71E2bB0d61Af' //DERC on ethereum Goerli testnet (DERC on goerly from matic faucet)
  //const childTokenAddress = '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1' //DERC on polygon mumbai testnet

  const rootTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7' //USDT on ethereum mainnet
  const childTokenAddress = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' //USDT on polygon

  //const parentProvider = infuraUrl //poor coding...use dotenv
  //const childProvider = 'https://rpc-mumbai.matic.today' //matic mumbai testnet
   //const amount = '1000000000000000000'  1eth
  
  const parentProvider = 'INFURA' //ethereum mainnet
  const childProvider = 'https://rpc-mainnet.matic.network' //matic v1 mainnet
  const amount = '100000000' //6 decimals ==?? 1 usdt so 100usdt test

  const [account, setAccount] = useState('')
  const [parentMaticPOSClient, setParentMaticPOSClient] = useState(null)
  const [childMaticPOSClient, setChildMaticPOSClient] = useState(null)
  const [burnTxHash, setBurnTxHash] = useState('')
  const mygasPrice = ethers.utils.parseUnits('25', 'gwei');

  useEffect(() => {
    const init = async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      //testnet
      // const parentMaticPOSClient = new MaticPOSClient({
      //   network: "testnet",
      //   version: "mumbai",
      //   parentProvider: window.ethereum,
      //   maticProvider: childProvider,
      // });

      // const childMaticPOSClient = new MaticPOSClient({
      //   network: "testnet",
      //   version: "mumbai",
      //   parentProvider: parentProvider,
      //   maticProvider: window.ethereum,
      // });

      //mainnet
      const parentMaticPOSClient = new MaticPOSClient({
        network: "mainnet",
        version: "v1",
        parentProvider: window.ethereum,
        maticProvider: childProvider,
      });

      const childMaticPOSClient = new MaticPOSClient({
        network: "mainnet",
        version: "v1",
        parentProvider: parentProvider,
        maticProvider: window.ethereum,
      });
      
      setAccount(accounts[0])
      setParentMaticPOSClient(parentMaticPOSClient)
      setChildMaticPOSClient(childMaticPOSClient)
    }

    if (window.ethereum) {
      init()
    } else {
      alert('No Ethereum provider')
    }
  }, [])

  const handleApprove = async () => {
    
    await parentMaticPOSClient.approveERC20ForDeposit(rootTokenAddress, amount, { 
      from: account
    })
  }

  const handleDeposit = async () => {
      const tx = await parentMaticPOSClient.depositERC20ForUser(rootTokenAddress, account, amount, {
        from: account, gasPrice: mygasPrice
      })
      alert('Did the Deposit work: ' + tx)
    }
  const handleBurn = async () => {
    const burnTxHash = await childMaticPOSClient.burnERC20(childTokenAddress, amount, { from: account })
    alert('Copy this transaction hash: ' + burnTxHash.transactionHash)
  }

  const handleExit = async () => {
    await parentMaticPOSClient.exitERC20(burnTxHash, { from: account, fastProof: true })
  }

  return (
    <div className="App">
      <h1 className="title">Polygon Matic bridge functions</h1>
      <div className="cards">
        <div className="card">
          <h2>ETH {'>'} Matic</h2>
          <div>
            <button onClick={handleApprove}>Approve</button> 
            <button onClick={handleDeposit}>Deposit</button>
          </div>
        </div>
        <div className="card">
          <h2>Matic {">"} ETH</h2>
          <input
            type="text"
            onChange={(event) => setBurnTxHash(event.target.value)}
            value={burnTxHash}
            placeholder="Paste burn tx hash here" />
          <div>
            <button onClick={handleBurn}>Burn</button>
            <button onClick={handleExit}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;