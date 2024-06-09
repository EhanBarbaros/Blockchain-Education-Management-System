const express = require('../smart_contracts/node_modules/express');
const bodyParser = require('../smart_contracts/node_modules/body-parser');
const Web3 = require('../smart_contracts/node_modules/web3');
const fs = require('../smart_contracts/node_modules/fs-extra');
const cors = require('../smart_contracts/node_modules/cors');
const app = express();
const { Pool } = require('../smart_contracts/node_modules/pg'); // Pool sınıfını içe aktarıyoruz
const bcrypt = require('../smart_contracts/node_modules/bcrypt');

app.use(cors());
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

// PostgreSQL bağlantısı
const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'Kullanicilar',
    password: 'snypr4151',
    port: 5432,
});



// API uç noktaları
app.post('/registerInstitution', async (req, res) => {

    console.log("Request Headers: ", req.headers);  // Gelen istek başlıklarını kontrol edin
    console.log("Received body: ", req.body);  // Gelen veriyi kontrol edin

    const { kurumAdi, telefon, adres, sektor, sifre } = req.body;
    console.log("Received body: ", req.body);  // Gelen veriyi kontrol edin

    try {
        if (!sifre) {
            console.log("Şifre eksik");  // Eksik şifre kontrolü
            return res.status(400).json({ success: false, message: 'Şifre gereklidir.' ,error: error.message});
        }
        const hashedPassword = await bcrypt.hash(sifre, 10);
        console.log("Hashed Password: ", hashedPassword);  // Şifre hash'ini kontrol edin
        const newInstitution = await pool.query(
            `INSERT INTO institutions (kurumAdi, telefon, adres, sektor, sifre)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [kurumAdi, telefon, adres, sektor, hashedPassword]
        );
        res.json({ success: true, institution: newInstitution.rows[0] });
    } catch (error) {
        console.error('Error registering institution: ', error);
        res.status(500).json({ success: false, message: 'Kurum eklenirken bir hata oluştu.', error: error.message });
    }
});



app.post('/loginInstitution', async (req, res) => {
    const { kurumAdi, sifre } = req.body;
    try {
        if (!kurumAdi || !sifre) {
            return res.status(400).json({ success: false, message: 'Kurum adı ve şifre gereklidir.' });
        }
        const institution = await pool.query(
            `SELECT * FROM institutions WHERE kurumAdi = $1`,
            [kurumAdi]
        );
        if (institution.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Kurum adı veya şifre hatalı.' });
        }
        const validPassword = await bcrypt.compare(sifre, institution.rows[0].sifre);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Kurum adı veya şifre hatalı.' });
        }
        res.json({
            success: true,
            message: 'Başarıyla giriş yapıldı',
            institution: institution.rows[0]
        });
    } catch (error) {
        console.error('Error logging in institution: ', error);
        res.status(500).json({ success: false, message: 'Giriş işlemi sırasında bir hata oluştu.', error: error.message });
    }
});

app.post('/registerUser', async (req, res) => {
    const { username, password, kurumId } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ success: false, message: 'Şifre gereklidir.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (username, password, kurumId)
            VALUES ($1, $2, $3) RETURNING *`,
            [username, hashedPassword, kurumId]
        );
        res.json({ success: true, user: newUser.rows[0] });
    } catch (error) {
        console.error('Error registering user: ', error);
        res.status(500).json({ success: false, message: 'Kullanıcı eklenirken bir hata oluştu.', error: error.message });
    }
});

app.post('/loginUser', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir.' });
        }
        const user = await pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );
        if (user.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });
        }
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });
        }
        res.json({
            success: true,
            message: 'Başarıyla giriş yapıldı',
            user: user.rows[0]
        });
    } catch (error) {
        console.error('Error logging in user: ', error);
        res.status(500).json({ success: false, message: 'Giriş işlemi sırasında bir hata oluştu.', error: error.message });
    }
});

app.get('/profil', async (req, res) => {
    try {
        if (req.user.type === 'institution') {
            const institution = await pool.query(`SELECT * FROM institutions WHERE id = $1`, [req.user.id]);
            res.json({ success: true, data: institution.rows[0] });
        } else if (req.user.type === 'user') {
            const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
            res.json({ success: true, data: user.rows[0] });
        }
    } catch (error) {
        console.error('Error querying profile: ', error);
        res.status(500).json({ success: false, message: 'Profil sorgulanırken bir hata oluştu.', error: error.message });
    }
});

app.post('/diplomaEkle', async (req, res) => {
    const { tcNo, ad, soyad, kurumId, mezuniyetTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { from: defaultAccount };
        const tx = await contract.methods.DiplomaEkle(tcNo, ad, soyad, kurumId, mezuniyetTarihi).send(options);
        res.json({ success: true, message: 'Diploma başarıyla eklendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Diploma eklenirken bir hata oluştu.', error: error.message });
    }
});

app.post('/sertifikaEkle',  async (req, res) => {
    const { tcNo, ad, soyad, kurumId, verilmeTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { from: defaultAccount };
        const tx = await contract.methods.SertifikaEkle(tcNo, ad, soyad, kurumId, verilmeTarihi).send(options);
        res.json({ success: true, message: 'Sertifika başarıyla eklendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika eklenirken bir hata oluştu.', error: error.message });
    }
});

app.post('/diplomaOnayla',  async (req, res) => {
    const { tcNo } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { from: defaultAccount };
        const tx = await contract.methods.DiplomaOnayla(tcNo).send(options);
        res.json({ success: true, message: 'Diploma başarıyla onaylandı.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Diploma onaylanırken bir hata oluştu.', error: error.message });
    }
});


app.post('/sertifikaOnayla', async (req, res) => {
    const { tcNo } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { from: defaultAccount };
        const tx = await contract.methods.SertifikaOnayla(tcNo).send(options);
        res.json({ success: true, message: 'Sertifika başarıyla onaylandı.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika onaylanırken bir hata oluştu.', error: error.message });
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
        res.status(500).json({ success: false, message: 'Diploma sorgulanırken bir hata oluştu.', error: error.message });
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
        res.status(500).json({ success: false, message: 'Sertifika sorgulanırken bir hata oluştu.', error: error.message });
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
        console.log('Transaction sent: ', tx);
        res.json({ success: true, message: 'Diploma başarıyla güncellendi.' });
    } catch (error) {
        console.error('Error updating diploma: ', error);
        res.status(500).json({ success: false, message: 'Diploma güncellenirken bir hata oluştu.', error: error.message });
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
        console.log('Transaction sent: ', tx);
        res.json({ success: true, message: 'Sertifika başarıyla güncellendi.' });
    } catch (error) {
        console.error('Error updating certificate: ', error);
        res.status(500).json({ success: false, message: 'Sertifika güncellenirken bir hata oluştu.', error: error.message });
    }
});

// API sunucusunu başlat
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
