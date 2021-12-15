# Decentralized Todo App

## Deployed App URL
[https://lucid-nightingale-900525.netlify.app/](https://lucid-nightingale-900525.netlify.app/)

## Address of Deoployed Contract on Ropsten Testnet
[0xC70ff1396d1C8c4A9be100cEDc94E718D151727E](https://ropsten.etherscan.io/address/0xC70ff1396d1C8c4A9be100cEDc94E718D151727E)

## Screencast URL
https://youtu.be/81KrjTRZLiw

## Prerequisites
* Truffle v5.4.12
* Nodejs v16.9.1
* Metamask web browser extension

## How to Test Locally
1. clone the project
2. run ```npm install```
3. start ganache-cli or Ganache GUI but make sure to edit the port number in `truffle-config.js`, currenty the project is set on 127.0.0.1:7545
4. run ```truffle compile```
5. run ```npm run copy``` to copy ABI files
6. run ```truffle migrate```
7. run ```npm run dev``` to start the front-end

* run ```truffle test``` to run the tests

## Directory Structure
* `build`: ABI files.
* `src`: Project's frontend.
* `contracts`: Soladity contracts code.
* `migrations`: Migration files for deploying contracts.
* `test`: Tests for smart contracts.


## Ethereum wallet for certification
0x4455e81d36C9AD6310A561cCbC4F31C920D26431