const express = require('../smart_contracts/node_modules/express');
const bodyParser = require('../smart_contracts/node_modules/body-parser');
const Web3 = require('../smart_contracts/node_modules/web3');
const fs = require('../smart_contracts/node_modules/fs-extra');
const app = express(); 
app.use(express.json());
app.use(bodyParser.json());

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const chainId = 1;
const port = 4151;
const contractName = 'Chaincode';

const rpcEndpoint = "http://localhost:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(rpcEndpoint));
var contractAddress = fs.readFileSync(contractName + ".txt", 'utf8').trim();
const contractJson = JSON.parse(fs.readFileSync(contractName + ".json"));
const contractAbi = contractJson.abi;
const contract = new web3.eth.Contract(contractAbi, contractAddress);



app.post('/diplomaEkle', async (req, res) => {
    const { tcNo, ad, soyad, kurumId, mezuniyetTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.DiplomaEkle(tcNo, ad, soyad, kurumId, mezuniyetTarihi).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Diploma başarıyla eklendi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Diploma eklenirken bir hata oluştu.' });
    }
});

app.post('/sertifikaEkle', async (req, res) => {
    const { tcNo, ad, soyad, kurumId, verilmeTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.SertifikaEkle(tcNo, ad, soyad, kurumId, verilmeTarihi).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Sertifika başarıyla eklendi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Sertifika eklenirken bir hata oluştu.' });
    }
});

app.post('/kurumEkle', async (req, res) => {
    const { kurumAdi, telefon, adres, sektor } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.KurumEkle(kurumAdi, telefon, adres, sektor).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Kurum başarıyla eklendi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Kurum eklenirken bir hata oluştu.' });
    }
});

app.post('/diplomaOnayla', async (req, res) => {
    const { tcNo } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.DiplomaOnayla(tcNo).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Diploma başarıyla onaylandı.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Diploma onaylanırken bir hata oluştu.' });
    }
});

app.post('/sertifikaOnayla', async (req, res) => {
    const { tcNo } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.SertifikaOnayla(tcNo).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Sertifika başarıyla onaylandı.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Sertifika onaylanırken bir hata oluştu.' });
    }
});

app.get('/diplomaSorgula/:tcNo', async (req, res) => {
    try {
        const { tcNo } = req.params;
        const data = await contract.methods.DiplomaSorgula(tcNo).call();
        res.json({
            TcNo: data[0], 
            Ad: data[1], 
            Soyad: data[2], 
            KurumId: data[3], 
            isState: data[4], 
            MezuniyetTarihi: data[5]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Diploma sorgulanırken bir hata oluştu.' });
    }
});

app.get('/sertifikaSorgula/:tcNo', async (req, res) => {
    try {
        const { tcNo } = req.params;
        const data = await contract.methods.SertifikaSorgula(tcNo).call();
        res.json({
            TcNo: data[0], 
            Ad: data[1], 
            Soyad: data[2], 
            KurumId: data[3], 
            isState: data[4], 
            VerilmeTarihi: data[5]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika sorgulanırken bir hata oluştu.' });
    }
});


app.post('/diplomaGuncelle', async (req, res) => {
    const { tcNo, ad, soyad, kurumId, mezuniyetTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.DiplomaGuncelle(tcNo, ad, soyad, kurumId, mezuniyetTarihi).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Diploma başarıyla güncellendi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Diploma güncellenirken bir hata oluştu.' });
    }
});

app.post('/sertifikaGuncelle', async (req, res) => {
    const { tcNo, ad, soyad, kurumId, verilmeTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { 
            from: defaultAccount,
        };
        const tx = await contract.methods.SertifikaGuncelle(tcNo, ad, soyad, kurumId, verilmeTarihi).send(options);
        await tx.wait();
        res.json({ success: true, message: 'Sertifika başarıyla güncellendi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Sertifika güncellenirken bir hata oluştu.' });
    }
});

app.listen(port, () => {
    console.log(`Server bu portta çalışıyor http://localhost:${port}`);
});