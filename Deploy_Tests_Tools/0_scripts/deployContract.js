const path = require('path');
const fs = require('../../smart_contracts/node_modules/fs-extra');
const ethers = require('../../smart_contracts/node_modules/ethers');
const yargs = require('../../smart_contracts/node_modules/yargs');

const argv = yargs
    .option('contract_json', {
        alias: 'cj',
        description: 'Smart contract JSON dosyası yolu',
        type: 'string',
    })
    .option('deploy_params', {
        alias: 'dp',
        description: 'Smart contract deploy parametreleri',
        type: 'array',
    })
    .demandOption(['contract_json'], 'Lütfen smart contractın JSON dosyasının yolunu belirtin')
    .help()
    .argv;

const { tessera, quorum } = require("../../smart_contracts/scripts/keys.js");
const host = quorum.rpcnode.url;
const accountPrivateKey = quorum.rpcnode.accountPrivateKey;
const contractJsonPath = argv.contract_json;
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBytecode = contractJson.evm.bytecode.object;
const deployParams = argv.deploy_params || [];

async function createContract(provider, wallet, contractAbi, contractByteCode, deployParams) {
    const factory = new ethers.ContractFactory(contractAbi, contractByteCode, wallet);
    const contract = await factory.deploy(...deployParams);
    const deployed = await contract.waitForDeployment();
    return contract;
}

async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    createContract(provider, wallet, contractAbi, contractBytecode, deployParams)
        .then(async function (contract) {
            contractAddress = await contract.getAddress();
            console.log(contractAddress);
        })
        .catch(console.error);
}

if (require.main === module) {
    main();
}

module.exports = exports = main;
