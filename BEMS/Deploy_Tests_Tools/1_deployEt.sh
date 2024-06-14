#!/bin/bash

echo -n "Smart contract dosyasının yolunu gir: "  #.sol uzantili olmali kontrol et
read contractPath
echo -n "Constructor parametrelerini gir (yoksa boş bırak): "
read contractParams

fileFullPath=$(realpath "$contractPath")   #home/ornek.sol
dirPath=$(dirname "$contractPath")         #.
fileName=$(basename "$contractPath")       #ornek.sol
contractName="${fileName%.sol}"            #ornek
caPath="${contractName}.txt"               #ornek.txt
jsonName="${dirPath}/${contractName}.json" #.json

node 0_scripts/compileContract.js --file $contractPath
echo "Compile edildi.."
echo "$contractName.json dosyası oluşturuldu.."

if [ -z "$contractParams" ]; then
  contractAddress=$(node 0_scripts/deployContract.js --cj "$jsonName")
else
  contractAddress=$(node 0_scripts/deployContract.js --cj "$jsonName" --dp "$contractParams")
fi
echo "Deploy edildi.."
echo "Contract adresi: $contractAddress"
echo "$contractAddress" > "$caPath"
echo "Contract adresi $caPath dosyasına kaydedildi."
