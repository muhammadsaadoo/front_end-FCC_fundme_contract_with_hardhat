// const { ethers } = require("ethers"); // we cant use with front end
//so we use import
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fund");
const getBalanceButtn = document.getElementById("getBalance");
const withdrawButtn = document.getElementById("withdraw");

connectButton.onclick = connect;
fundButton.onclick = fund;
console.log(ethers);
getBalanceButtn.onclick = getBalance;
withdrawButtn.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("matamask exists");
    try {
      const responce = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (error) {
      console.log(error);
    }
    console.log("connected");
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    console.log(accounts);
  } else {
    console.log("no metamsk here");
  }
}

//create fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;

  console.log("funding with ", ethAmount);
  //check if wallet is connected or not
  if (typeof window.ethereum !== "undefined") {
    //provider for connecting to blockchain
    //signer /wallet account
    //contract ABI & address from backend code artifacts/contracts/fundme.json
    //for all these functions we need ethers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(provider);

    const signer = provider.getSigner();
    console.log(signer);
    //create a file constants.js
    //add address   and abi in contracts.js
    //getting address from running command yarn hardhat node
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponce = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransaction(transactionResponce, provider);
      console.log("funding done!");
    } catch (error) {
      console.log(error);
    }
    // error insuffient funds because we are not connected to local hardhat network
    //so add network Hardhat Localhost in metamask
    //copy one hardhat account private key and paste it in metamask import accounts
    //error noncr too high --> reset account but only fake ethers
  }
}
//listen that the transaction to be mined
async function listenForTransaction(transactionResponce, provider) {
  console.log(`mining ${transactionResponce.hash}......`);
  //the provider.once not wait
  return new Promise((resolve, reject) => {
    provider.once(transactionResponce.hash, (transactionReciept) => {
      console.log(
        `completed with ${transactionReciept.confirmations} confirmations`
      );
      resolve();
    });
  });
}
async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

//create withdraw function

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("withdrawing....");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponce = await contract.withdraw();
      await listenForTransaction(transactionResponce, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
