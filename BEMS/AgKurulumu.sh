#!bin/bash

#Root'a gider
sudo su | 1

# Bellek kontrolü
ram=$(free -h | awk '/^Mem:/ {print $7}')
echo "AvailableMem = "$ram
ram_val=$(echo $ram | cut -d 'G' -f 1)
float_ram_val=$(echo "${ram_val//,/.}" | bc -l )
if (( $(echo "$float_ram_val < 4" | bc -l) ))
then echo "Yeterli ram yok (Min:4Gi)"; exit 1
fi

# Docker ve Docker Compose'u yükle
apt-get update
apt-get install curl
apt-get install bc
yes | apt install apt-transport-https ca-certificates curl software-properties-common
yes | curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
yes | add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
yes | apt-cache policy docker-ce
yes | apt install docker-ce
yes | curl -L -k "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64" -o /usr/bin/docker-compose
chmod +x /usr/bin/docker-compose

# Node.js ve npm'i yükle
apt-get update &&  apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs
npm set strict-ssl false
npm install -g npm

# Docker için minimum bellek kontrolü
dockermem=$(docker info --format '{{.MemTotal}}')
NORMAL_MINIMUM=$(( 4 * 1000 * 1000 * 1000 ))
if (( $dockermem < $NORMAL_MINIMUM ))
then echo "Docker'ın en az 4 GB kullanılabilir belleğe sahip olması gerekir."; exit 1
fi

# Quorum blockchain geliştirme ortamını başlat
npx quorum-dev-quickstart
cd quorum-test-network/smart_contracts/
npm install solc
npm install yargs
npm install fs-extra
npm install pg 
npm install jsonwebtoken 
npm install bcrypt
cd ../../
chmod -R 777 quorum-test-network/
cd quorum-test-network
umask 000
./run.sh

#Eto kullanıcısına döner
su eto

# PostgreSQL eklentilerini yükle
apt-get install postgresql
