// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Chaincode {

    string public constant Onaylanmadi = "Onaylanmadi";
    string public constant Onaylandi = "Onaylandi";

    struct DiplomaStruct {
        string TcNo;
        string Ad;
        string Soyad;
        uint256 KurumId;
        string isState;
        string MezuniyetTarihi;
    }


    struct SertifikaStruct {
        string TcNo;
        string Ad;
        string Soyad;
        uint256 KurumId;
        string isState;
        string VerilmeTarihi;
    }
    
struct KullaniciStruct {
        string TcNo;
        string Ad;
        string Soyad;
        string KullaniciAdi;
        string Sifre;
        string[] Diplomalar;
        string[] Sertifikalar;
    }

    struct KurumStruct{
       uint256 KurumId;
       string KurumAdi;
       string Telefon;
       string Adres;
       string Sektor;
       string sifre;
    } 

    mapping(string => DiplomaStruct) public diploma;
    uint256 public DiplomaId;
    mapping(string => SertifikaStruct) public sertifika;
    uint256 public SertifikaId;
    mapping(uint => KurumStruct) public kurum;
    uint256 public kurumId;
    mapping(string => KurumStruct) public kurumAdi;
    
    mapping(string => KullaniciStruct) public kullanici;

function DiplomaEkle(
    string memory _tcNo, 
    string memory _ad, 
    string memory _soyad, 
    uint256 _kurumId,
    string memory _mezuniyetTarihi) 
public { 
 require(keccak256(abi.encodePacked(_tcNo)) != keccak256(abi.encodePacked("")) ,  string(abi.encodePacked("TcNo bos birakilamaz.")));
 DiplomaStruct memory GeciciDiploma;
 require(keccak256(abi.encodePacked(diploma[_tcNo].TcNo)) != keccak256(abi.encodePacked(_tcNo)),"Bu TC ile zaten bir diploma kayitli.");

    GeciciDiploma.TcNo=_tcNo;
    GeciciDiploma.Ad=_ad;
    GeciciDiploma.Soyad=_soyad;
    GeciciDiploma.KurumId=_kurumId;
    GeciciDiploma.MezuniyetTarihi=_mezuniyetTarihi;
    GeciciDiploma.isState=Onaylanmadi;

    diploma[_tcNo] = GeciciDiploma;
    kullanici[_tcNo].Diplomalar.push(_tcNo);
    DiplomaId++;
}

function DiplomaOnayla(string memory _tcNo)  public {
    require(bytes(diploma[_tcNo].TcNo).length > 0, "Diploma bulunamadi.");
        diploma[_tcNo].isState = Onaylandi;
}

function SertifikaEkle(
    string memory _tcNo, 
    string memory _ad, 
    string memory _soyad, 
    uint256 _kurumId,
    string memory _verilmeTarihi) 
public {
require(keccak256(abi.encodePacked(_tcNo)) != keccak256(abi.encodePacked("")) ,  string(abi.encodePacked("TcNo bos birakilamaz.")));
SertifikaStruct memory GeciciSertifika;
require(keccak256(abi.encodePacked(sertifika[_tcNo].TcNo)) != keccak256(abi.encodePacked(_tcNo)),"Bu TC ile zaten bir sertifika kayitli.");
    GeciciSertifika.TcNo=_tcNo;
    GeciciSertifika.Ad=_ad;
    GeciciSertifika.Soyad=_soyad;
    GeciciSertifika.KurumId=_kurumId;
    GeciciSertifika.VerilmeTarihi=_verilmeTarihi;
    GeciciSertifika.isState=Onaylanmadi;

    sertifika[_tcNo] = GeciciSertifika;
    kullanici[_tcNo].Sertifikalar.push(_tcNo);
    SertifikaId++;
    }

function SertifikaOnayla(string memory _tcNo)  public {
    require(bytes(sertifika[_tcNo].TcNo).length > 0, "Sertifika bulunamadi.");
    sertifika[_tcNo].isState = Onaylandi;
}

function KurumEkle
(
string memory _kurumAdi,
string memory _telefon,
string memory _adres,
string memory _sektor,
string memory _sifre) public 
{
    require(keccak256(abi.encodePacked(_kurumAdi)) != keccak256(abi.encodePacked("")) ,  string(abi.encodePacked("Kurum Adi bos birakilamaz.")));
    KurumStruct memory GeciciKurum;
    require(bytes(kurumAdi[_kurumAdi].KurumAdi).length == 0, "Bu isimle zaten bir kurum kayitli.");

        GeciciKurum.KurumAdi=_kurumAdi;
        GeciciKurum.KurumId=kurumId;
        GeciciKurum.Adres=_adres;
        GeciciKurum.Sektor=_sektor;
        GeciciKurum.Telefon=_telefon;
        GeciciKurum.sifre = _sifre;

        kurum[kurumId] = GeciciKurum;
        kurumAdi[_kurumAdi] = GeciciKurum;
        kurumId++;
}

function KullaniciEkle(
        string memory _tcNo,
        string memory _ad,
        string memory _soyad,
        string memory _kullaniciAdi,
        string memory _sifre
    ) public {
        require(bytes(_tcNo).length > 0, "TcNo bos birakilamaz.");
        require(bytes(kullanici[_tcNo].TcNo).length == 0, "Bu TC ile zaten bir kullanici kayitli.");

        string[] memory bosDizi;

        KullaniciStruct memory yeniKullanici = KullaniciStruct({
            TcNo: _tcNo,
            Ad: _ad,
            Soyad: _soyad,
            KullaniciAdi: _kullaniciAdi,
            Sifre: _sifre,
            Diplomalar: bosDizi,
            Sertifikalar: bosDizi
        });

        kullanici[_tcNo] = yeniKullanici;
    }

function kurumAdiGetir(string memory _kurumAdi)  public view returns (KurumStruct memory){
     KurumStruct memory gecicikurum = kurumAdi[_kurumAdi];
        return gecicikurum;
}

function KullaniciTcGetir(string memory _tc)  public view returns (KullaniciStruct memory){
     KullaniciStruct memory gecicikullanici = kullanici[_tc];
        return gecicikullanici;
}


    function DiplomaSorgula(uint256 _tcNo) public  view returns 
    (
        string[5] memory
    ) 
    {
        DiplomaStruct storage diplomaSorgula = diploma[uintToStr(_tcNo)];
        string[5] memory sorgulaReturn;

        sorgulaReturn[0] = string(diplomaSorgula.Ad);
        sorgulaReturn[1] = string(diplomaSorgula.Soyad);
        sorgulaReturn[2] = string(diplomaSorgula.isState);
        sorgulaReturn[3] = string(uintToStr(diplomaSorgula.KurumId));
        sorgulaReturn[4] = string(diplomaSorgula.MezuniyetTarihi);

        return sorgulaReturn;
    }

    function SertifikaSorgula(string memory _tcNo) public  view returns 
    (
        string[5] memory
    ) 
    {
        SertifikaStruct storage sertifikaSorgula = sertifika[_tcNo];
        string[5] memory sorgulaReturn;

        sorgulaReturn[0] = string(sertifikaSorgula.Ad);
        sorgulaReturn[1] = string(sertifikaSorgula.Soyad);
        sorgulaReturn[2] = string(sertifikaSorgula.isState);
        sorgulaReturn[3] = string(uintToStr(sertifikaSorgula.KurumId));
        sorgulaReturn[4] = string(sertifikaSorgula.VerilmeTarihi);

        return sorgulaReturn;
    }

    function DiplomaGuncelle
    (string memory _tcNo, string memory _ad, string memory _soyad, uint256 _kurumId ,string memory _mezuniyetTarihi    
    ) public 
    {
        require(keccak256(abi.encodePacked(_tcNo)) != keccak256(abi.encodePacked("")) ,  string(abi.encodePacked("TcNo bos birakilamaz.")));  
        DiplomaStruct storage DiplomaMapping = diploma[_tcNo];    
        DiplomaMapping.TcNo=_tcNo;
        DiplomaMapping.Ad=_ad;
        DiplomaMapping.Soyad=_soyad;
        DiplomaMapping.KurumId=_kurumId;
        DiplomaMapping.MezuniyetTarihi=_mezuniyetTarihi;
        DiplomaMapping.isState=Onaylanmadi;
    }

    function SertifikaGuncelle
    (string memory _tcNo, string memory _ad, string memory _soyad, uint256 _kurumId ,string memory _verilmeTarihi    
    ) public 
    {
        require(keccak256(abi.encodePacked(_tcNo)) != keccak256(abi.encodePacked("")) ,  string(abi.encodePacked("TcNo bos birakilamaz.")));  
        SertifikaStruct storage SertifikaMapping = sertifika[_tcNo];    
        SertifikaMapping.TcNo=_tcNo;
        SertifikaMapping.Ad=_ad;
        SertifikaMapping.Soyad=_soyad;
        SertifikaMapping.KurumId=_kurumId;
        SertifikaMapping.VerilmeTarihi=_verilmeTarihi;
        SertifikaMapping.isState=Onaylanmadi;
    }

    function uintToStr(uint256 _value) internal pure returns (string memory) {
        if (_value == 0) {
            return "0";
        }
        uint256 temp = _value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + _value % 10));
            _value /= 10;
        }
        return string(buffer);
    }


//    node 2_fonkCalistir.js --cn Chaincode --ft get --fn SertifikaSorgula --fp '["12345678911"]'
//    node 2_fonkCalistir.js --cn Chaincode --ft get --fn DiplomaSorgula --fp '["12345678910"]'

//    node 2_fonkCalistir.js --cn Chaincode --ft set --fn DiplomaEkle --fp '["12345678910","eto","barbaros",1,"20241213"]'
//    node 2_fonkCalistir.js --cn Chaincode --ft set --fn SertifikaEkle --fp '["12345678911","kutay","dede",1,"20241213"]'  

//    node 2_fonkCalistir.js --cn Chaincode --ft set --fn DiplomaGuncelle --fp '["12345678911","baran","dede",1,"20241213"]' 

//    node 2_fonkCalistir.js --cn Chaincode --ft set --fn SertifikaGuncelle --fp '["12345678911","oktay","bilge",1,"20241213"]'        


}
