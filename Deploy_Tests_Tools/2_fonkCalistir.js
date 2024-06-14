const path = require('path');
const fs = require('../smart_contracts/node_modules/fs-extra');
const Contract = require('../smart_contracts/node_modules/web3-eth-contract');
const yargs = require('../smart_contracts/node_modules/yargs');


const argv = yargs
    .option('contract_name', {
        alias: 'cn',
        description: 'Smart contract adi',
        type: 'string',
    })
    .option('function_type', {
        alias: 'ft',
        description: 'Fonksiyon türü seçimi (get/set)',
        type: 'string',
    })
    .option('function_name', {
        alias: 'fn',
        description: 'Çalıştırılacak fonksiyon adı',
        type: 'string',
    })
    .option('function_params', {
        alias: 'fp',
        description: 'Fonksiyon parametreleri',
        type: 'string',
    })
    .demandOption(['contract_name', 'function_name', 'function_params'], 'Lütfen smart contract adını, çalıştırılacak fonksiyon adını ve fonksiyon parametrelerini belirtiniz')
    .demandOption(['function_type'], 'Lütfen çalıştırmak istediğiniz fonksiyon türünü belirtiniz (get veya set)')
    .help()
    .argv;

const { tessera, quorum } = require("../smart_contracts/scripts/keys.js");
const host = quorum.rpcnode.url;
const accountAddress = quorum.rpcnode.accountAddress;
const contractJsonPath = argv.contract_name  + ".json";
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractAddress = fs.readFileSync(argv.contract_name + ".txt", 'utf8').trim();
const functionType = argv.function_type;
const functionName = argv.function_name;
const functionParams = JSON.parse(argv.function_params);

async function fonkCalistir(host, deployedContractAbi, deployedContractAddress, functionType, functionName, functionParams, accountAddress) {
    Contract.setProvider(host);
    var contract = new Contract(deployedContractAbi, deployedContractAddress);

    try {
        if (functionType === "get" || functionType === "GET") {
            const variab = await contract.methods[functionName](...functionParams).call();
            console.log(variab);
            return variab;
        } else if (functionType === "set" || functionType === "SET") {
            const variab = await contract.methods[functionName](...functionParams).send({ from: accountAddress, gasPrice: "0x0"});
            console.log("Fonksiyon basariyla calistirildi...");
            //console.log(variab);    //variab degerini yazdirirsa islem ve blok bilgisini verir
            return "";
        } else {
            console.log("Lütfen çalıştırmak istediğiniz fonksiyon türünü doğru belirtiniz (get veya set)");
            return "";
        }
    } catch (error) {
        console.error('Hata:', error.message);
    }
}

//fonkCalistir(host, contractAbi, contractAddress, functionType, functionName, functionParams, accountAddress);

function getTarih() {
  var tarih = new Date();
  var yil = tarih.getFullYear();
  var ay = tarih.getMonth() + 1;
  var gun = tarih.getDate();
  ay = ay < 10 ? "0" + ay : ay;
  gun = gun < 10 ? "0" + gun : gun;
  var yilAyGunFormati = yil + "" + ay + "" + gun;
  return yilAyGunFormati;
}

const tarih = getTarih();
const updatedFunctionParams = functionParams.map(param => param === '$tarih' ? tarih : param);
fonkCalistir(host, contractAbi, contractAddress, functionType, functionName, updatedFunctionParams, accountAddress);
