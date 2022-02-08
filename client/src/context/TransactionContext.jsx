import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

// (i) ABI stands for Application Binary Interface
// get our contract from the blockchain
const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

// any value will be accessible throughout the whole app
// main.jsx wraps the <App> with <TransactionProvider>
export const TransactionProvider = ({ children }) => {

  const [currentAccount, setCurrentAccount] = useState('');
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactonCount] = useState(localStorage.getItem('transactionCount'));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: e.target.value
    }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');
      const transactionsContract = createEthereumContract();

      const availableTransactions = await transactionsContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }));

      console.log(structuredTransactions);

      setTransactions(structuredTransactions);
    } catch (e) {
      console.error(e);
    }

  };

  const checkIfWalletIsConnected = async () => {
    try {
      // if no ethereum user needs to install metamask
      if (!ethereum) return alert('Please install metamask');

      // get ethereum account
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();

      } else {
        console.log('No account found');
      }
    } catch (e) {
      console.log(e);
      throw new Error('No ethereum object');
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        // getTransactionCount is a function deployed with the contract
        const currentTransactionCount = await transactionsContract.getTransactionCount();

        window.localStorage.setItem('transactionCount', currentTransactionCount);
      }
    } catch (error) {
      console.log(error);
      throw new Error('No ethereum object');
    }
  };

  // connect to metamask
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      setCurrentAccount(accounts[0]);

    } catch (e) {
      console.log(e);
      throw new Error('No ethereum object');
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const {
        addressTo,
        amount,
        keyword,
        message
      } = formData;
      const transactionContract = createEthereumContract();

      // ether is defined in hexadecimal
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: '0c5208', // 21000 GWEI subunit of Ether
          value: parsedAmount._hex
        }]
      });

      // this functions is defined in Transactions.sol
      // it is stored in the blockchain inside the contract I created
      // this function will take some time
      const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
      setIsLoading(true);
      console.log('loading ' + transactionHash.hash);
      await transactionHash.wait();
      setIsLoading(false);
      console.log('success ' + transactionHash.hash);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactonCount(transactionCount.toNumber());

    } catch (e) {
      console.log(e);
      throw new Error('No ethereum object');
    }
  };

  // on load
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExists();
  }, []);

  return (
    <TransactionContext.Provider
      value={ {
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading
      } }
    >
      { children }
    </TransactionContext.Provider>
  );
};
