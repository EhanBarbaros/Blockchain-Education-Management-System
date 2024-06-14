const express = require('../smart_contracts/node_modules/express');
const bodyParser = require('../smart_contracts/node_modules/body-parser');
const Web3 = require('../smart_contracts/node_modules/web3');
const fs = require('../smart_contracts/node_modules/fs-extra');
const cors = require('../smart_contracts/node_modules/cors');
const app = express();
const { Pool } = require('../smart_contracts/node_modules/pg'); // Pool sınıfını içe aktarıyoruz
const jwt = require('../smart_contracts/node_modules/jsonwebtoken');
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
const contractAddress = fs.readFileSync(contractName + ".txt", 'utf8').trim();
const contractJson = JSON.parse(fs.readFileSync(contractName + ".json"));
const contractAbi = contractJson.abi;
const contract = new web3.eth.Contract(contractAbi, contractAddress);
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'kullanicilar',
    password: 'snypr4151',
    port: 5432,
});
const JWT_SECRET = 'your_jwt_secret';

// Middleware to verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Yetkilendirme hatası.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token doğrulama hatası.' });
        req.user = user;
        next();
    });
}

// Register Institution
app.post('/registerInstitution', async (req, res) => {
    const { kurumAdi, telefon, adres, sektor, sifre } = req.body;
    try {
        // Kurum adı kontrolü
        const existingInstitution = await pool.query(
            `SELECT * FROM institutions WHERE kurumAdi = $1`,
            [kurumAdi]
        );

        if (existingInstitution.rows.length > 0) {
            console.log('Institution already exists:', existingInstitution.rows[0]);
            return res.status(400).json({ success: false, message: 'Bu kurum adı zaten mevcut.' });
        }

        const hashedPassword = await bcrypt.hash(sifre, 10);

        const newInstitution = await pool.query(
            `INSERT INTO institutions (kurumAdi, telefon, adres, sektor, sifre)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [kurumAdi, telefon, adres, sektor, hashedPassword]
        );

        console.log('New institution added:', newInstitution.rows[0]);
        res.json({ success: true, institution: newInstitution.rows[0] });
    } catch (error) {
        console.error('Error registering institution:', error); 
        res.status(500).json({ success: false, message: 'Kurum eklenirken bir hata oluştu.', error: error.message });
    }
});



// Login Institution
app.post('/loginInstitution', async (req, res) => {
    const { kurumAdi, sifre } = req.body;
    try {
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
        const token = jwt.sign({ id: institution.rows[0].id, type: 'institution' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, message: 'Başarıyla giriş yapıldı', token });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Giriş işlemi sırasında bir hata oluştu.', error: error.message });
    }
});

// Get Profile
app.get('/profil', authenticateToken, async (req, res) => {
    try {
        if (req.user.type === 'institution') {
            const institution = await pool.query(`SELECT * FROM institutions WHERE id = $1`, [req.user.id]);
            res.json({ success: true, data: institution.rows[0] });
        } else if (req.user.type === 'user') {
            const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
            res.json({ success: true, data: user.rows[0] });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Profil sorgulanırken bir hata oluştu.', error: error.message });
    }
});

app.post('/diplomaEkle', authenticateToken, async (req, res) => {
    const { tcNo, ad, soyad, kurumId, mezuniyetTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        console.log('Varsayılan hesap:', defaultAccount); 

        const options = { from: defaultAccount };
        const tx = await contract.methods.DiplomaEkle(tcNo, ad, soyad, kurumId, mezuniyetTarihi).send(options);

        console.log('İşlem gönderildi:', tx); 
        res.json({ success: true, message: 'Diploma başarıyla eklendi.' });
    } catch (error) {
        console.error('Diploma eklenirken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Diploma eklenirken bir hata oluştu.', error: error.message });
    }
});


// Add Certificate
app.post('/sertifikaEkle', authenticateToken, async (req, res) => {
    const { tcNo, ad, soyad, kurumId, verilmeTarihi,sertifikaAdi  } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { from: defaultAccount };
        await contract.methods.SertifikaEkle(tcNo, ad, soyad, kurumId, verilmeTarihi,sertifikaAdi ).send(options);
        res.json({ success: true, message: 'Sertifika başarıyla eklendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika eklenirken bir hata oluştu.', error: error.message });
    }
});

// Approve Diploma
app.post('/diplomaOnayla', authenticateToken, async (req, res) => {
    const { tcNo } = req.body;
    try {
        const data = await contract.methods.DiplomaSorgula(tcNo).call();
        const kurumId = parseInt(data[3], 10);

        if (req.user.id !== kurumId) {
            return res.status(403).json({ success: false, message: 'Bu diploma üzerinde onaylama yetkiniz yok.' });
        }

        if (!tcNo || typeof tcNo !== 'string' || tcNo.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Geçersiz TC No.' });
        }

        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        console.log('Varsayılan hesap:', defaultAccount);

        const options = { from: defaultAccount };
        await contract.methods.DiplomaOnayla(tcNo).send(options);
        res.json({ success: true, message: 'Diploma başarıyla onaylandı.' });
    } catch (error) {
        console.error('Diploma onaylanırken bir hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Diploma onaylanırken bir hata oluştu.', error: error.message });
    }
});

// Approve Certificate
app.post('/sertifikaOnayla', authenticateToken, async (req, res) => {
    const { tcNo } = req.body;
    try {
        const data = await contract.methods.SertifikaSorgula(tcNo).call();
        const kurumId = parseInt(data[4], 10);

        if (req.user.id !== kurumId) {
            return res.status(403).json({ success: false, message: 'Bu sertifika üzerinde onaylama yetkiniz yok.' });
        }

        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const options = { from: defaultAccount };
        await contract.methods.SertifikaOnayla(tcNo).send(options);
        res.json({ success: true, message: 'Sertifika başarıyla onaylandı.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika onaylanırken bir hata oluştu.', error: error.message });
    }
});

// Query Diploma
app.post('/diplomaSorgula', authenticateToken, async (req, res) => {
    const { tcNo } = req.body; // body içinden TC Kimlik Numarası alınıyor
    try {
        // TC Kimlik Numarası'na göre diploma sorgulama işlemi yapılıyor
        const data = await contract.methods.DiplomaSorgula(tcNo).call();
        // Sonucu JSON formatında gönderme
        res.json({
            success: true,
            TcNo: data[0],
            Ad: data[1],
            Soyad: data[2],
            KurumId: data[3],
            isState: data[4],
            MezuniyetTarihi: data[5]
        });
    } catch (error) {
        console.log('Diploma sorgulanırken bir hata oluştu:', error.message)
        console.error('Diploma sorgulanırken bir hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Diploma sorgulanırken bir hata oluştu.', error: error.message });
    }
});


// Query Certificate
app.post('/sertifikaSorgula', authenticateToken, async (req, res) => {
    const { tcNo } = req.body;
    try {
        const data = await contract.methods.SertifikaSorgula(tcNo).call();
        res.json({
            success: true,
            TcNo: data[0],
            Ad: data[1],
            Soyad: data[2],
            KurumId: data[3],
            isState: data[4],
            VerilmeTarihi: data[5],
            SertifikaAdi: data[6]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika sorgulanırken bir hata oluştu.', error: error.message });
    }
});

// Update Diploma
app.post('/diplomaGuncelle', authenticateToken, async (req, res) => {
    const { tcNo, ad, soyad, kurumId, mezuniyetTarihi } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const diploma = await contract.methods.DiplomaSorgula(tcNo).call();
        if (diploma[3] !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Sadece ilgili kurum diplomasını güncelleyebilir.' });
        }
        const options = { from: defaultAccount };
        await contract.methods.DiplomaGuncelle(tcNo, ad, soyad, kurumId, mezuniyetTarihi).send(options);
        res.json({ success: true, message: 'Diploma başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Diploma güncellenirken bir hata oluştu.', error: error.message });
    }
});

// Update Certificate
app.post('/sertifikaGuncelle', authenticateToken, async (req, res) => {
    const { tcNo, ad, soyad, kurumId, verilmeTarihi,sertifikaAdi  } = req.body;
    try {
        const defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const sertifika = await contract.methods.SertifikaSorgula(tcNo).call();
        if (sertifika[4] !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Sadece ilgili kurum sertifikayı güncelleyebilir.' });
        }
        const options = { from: defaultAccount };
        await contract.methods.SertifikaGuncelle(tcNo, ad, soyad, kurumId, verilmeTarihi,sertifikaAdi ).send(options);
        res.json({ success: true, message: 'Sertifika başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sertifika güncellenirken bir hata oluştu.', error: error.message });
    }
});

// Start API server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});