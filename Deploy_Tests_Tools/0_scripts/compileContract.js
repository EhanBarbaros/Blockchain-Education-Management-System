const path = require('path');
const fs = require('../../smart_contracts/node_modules/fs-extra');
const solc = require('../../smart_contracts/node_modules/solc');
const yargs = require('../../smart_contracts/node_modules/yargs');

function compileContract(filePath) {
  const fileFullPath = path.resolve(filePath);
  const dirPath = path.dirname(filePath);
  const fileName = path.basename(fileFullPath);

  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: {
        content: fs.readFileSync(fileFullPath, 'utf8')
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': [ '*', 'evm.bytecode'  ]
        }
      }
    }
  };

  const stringifiedJson = JSON.stringify(input);
  const compilationResult = solc.compile(stringifiedJson);
  const output = JSON.parse(compilationResult);
  const compiledContracts = output.contracts;

  for (let contract in compiledContracts) {
    for (let contractName in compiledContracts[contract]) {
      fs.outputJsonSync(
        path.resolve(dirPath, `${contractName}.json`),
        compiledContracts[contract][contractName], { spaces: 2 }
      );
    }
  }
}

const main = () => {
  const argv = yargs
    .options({
      'file': {
        alias: 'f',
        describe: 'Contract dosyasının yolu',
        demandOption: true,
        type: 'string'
      }
    })
    .demandOption(['file'], 'Lütfen smart contract dosyasının yolunu belirtin')
    .help()
    .argv;

  const filePath = argv.file;
  compileContract(filePath);
};

if (require.main === module) {
  main();
}

module.exports = exports = main;
