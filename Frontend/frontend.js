document.addEventListener('DOMContentLoaded', () => {
    const kurumKayitButton = document.getElementById('kurumKayitButton');
    const kullaniciKayitButton = document.getElementById('kullaniciKayitButton');
    const kurumKayitForm = document.getElementById('kurumKayitForm');
    const kullaniciKayitForm = document.getElementById('kullaniciKayitForm');
    const formMessage = document.getElementById('formMessage');

    kurumKayitButton.addEventListener('click', () => {
        kurumKayitForm.style.display = 'block';
        kullaniciKayitForm.style.display = 'none';
        formMessage.style.display = 'none';
    });

    kullaniciKayitButton.addEventListener('click', () => {
        kullaniciKayitForm.style.display = 'block';
        kurumKayitForm.style.display = 'none';
        formMessage.style.display = 'none';
    });

    kurumKayitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const kurumAdi = document.getElementById('kurumAdi').value;
        const telefon = document.getElementById('telefon').value;
        const adres = document.getElementById('adres').value;
        const sektor = document.getElementById('sektor').value;
        const sifre = document.getElementById('kurumSifre').value;

        try {
            const response = await fetch('/kurumEkle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kurumAdi, telefon, adres, sektor, sifre })
            });
            const result = await response.json();
            if (result.success) {
                alert('Kurum başarıyla kaydedildi.');
                kurumKayitForm.reset();
            } else {
                alert('Kurum kaydedilirken bir hata oluştu: ' + result.message);
            }
        } catch (error) {
            console.error('Kurum kaydedilirken bir hata oluştu:', error);
        }
    });

    kullaniciKayitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tcNo = document.getElementById('tcNo').value;
        const ad = document.getElementById('ad').value;
        const soyad = document.getElementById('soyad').value;
        const kullaniciAdi = document.getElementById('kullaniciAdi').value;
        const sifre = document.getElementById('kullaniciSifre').value;

        try {
            const response = await fetch('/kullaniciEkle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tcNo, ad, soyad, kullaniciAdi, sifre })
            });
            const result = await response.json();
            if (result.success) {
                alert('Kullanıcı başarıyla kaydedildi.');
                kullaniciKayitForm.reset();
            } else {
                alert('Kullanıcı kaydedilirken bir hata oluştu: ' + result.message);
            }
        } catch (error) {
            console.error('Kullanıcı kaydedilirken bir hata oluştu:', error);
        }
    });
});

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let thumbnails = document.getElementsByClassName("thumbnail");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
        thumbnails[i].firstElementChild.classList.remove("active");
        thumbnails[i].firstElementChild.classList.add("blur");
    }
    slides[slideIndex-1].style.display = "block";  
    thumbnails[slideIndex-1].firstElementChild.classList.add("active");
    thumbnails[slideIndex-1].firstElementChild.classList.remove("blur");
}

document.addEventListener('DOMContentLoaded', (event) => {
    let slideIndex = 0;
    showSlidesAuto();

    function showSlidesAuto() {
        let slides = document.getElementsByClassName("slide");
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}    
        slides[slideIndex-1].style.display = "block";  
        setTimeout(showSlidesAuto, 4000); // Change image every 4 seconds
    }

    let textSlideIndex = 0;
    showTextSlidesAuto();

    function showTextSlidesAuto() {
        let textSlides = document.getElementsByClassName("text-slide");
        for (let i = 0; i < textSlides.length; i++) {
            textSlides[i].style.display = "none";  
        }
        textSlideIndex++;
        if (textSlideIndex > textSlides.length) {textSlideIndex = 1}    
        textSlides[textSlideIndex-1].style.display = "flex";  
        setTimeout(showTextSlidesAuto, 4000); // Change text every 4 seconds
    }
});

const loginModal = document.getElementById("loginModal");
const loginButton = document.getElementById("loginButton");
const span = document.getElementsByClassName("close")[0];

loginButton.onclick = function() {
    loginModal.style.display = "block";
}

span.onclick = function() {
    loginModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const kullaniciAdi = document.getElementById('kullaniciAdi').value;
    const sifre = document.getElementById('sifre').value;

    const response = await fetch('/kurumLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullaniciAdi, sifre })
    });
    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loginModal.style.display = "none";
    }
});


function showForm(formId) {
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) initialMessage.style.display = 'none';
    
    const forms = document.querySelectorAll('.form-section');
    forms.forEach(form => {
        form.style.display = 'none';
    });

    document.getElementById(formId).style.display = 'block';
}

document.getElementById('sertifikaEkleForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const tcNo = document.getElementById('tcNoEkle').value;
    const ad = document.getElementById('adEkle').value;
    const soyad = document.getElementById('soyadEkle').value;
    const kurumId = document.getElementById('kurumIdEkle').value;
    const verilmeTarihi = document.getElementById('verilmeTarihiEkle').value;

    const response = await fetch('/sertifikaEkle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcNo, ad, soyad, kurumId, verilmeTarihi })
    });
    const result = await response.json();
    alert(result.message);
});

document.getElementById('sertifikaOnaylaForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const tcNo = document.getElementById('tcNoOnayla').value;

    const response = await fetch('/sertifikaOnayla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcNo })
    });
    const result = await response.json();
    alert(result.message);
});

document.getElementById('sertifikaSorgulaForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const tcNo = document.getElementById('tcNoSorgula').value;

    const response = await fetch(`/sertifikaSorgula/${tcNo}`);
    const result = await response.json();
    const sonucDiv = document.getElementById('sertifikaSonuc');
    if (result.success) {
        sonucDiv.innerHTML = `
            <p>TC No: ${result.TcNo}</p>
            <p>Ad: ${result.Ad}</p>
            <p>Soyad: ${result.Soyad}</p>
            <p>Kurum ID: ${result.KurumId}</p>
            <p>Verilme Tarihi: ${result.VerilmeTarihi}</p>
            <p>Durum: ${result.isState}</p>
        `;
    } else {
        sonucDiv.innerHTML = `<p>${result.message}</p>`;
    }
});


document.getElementById('diplomaEkleForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const tcNo = document.getElementById('tcNoEkle').value;
    const ad = document.getElementById('adEkle').value;
    const soyad = document.getElementById('soyadEkle').value;
    const kurumId = document.getElementById('kurumIdEkle').value;
    const mezuniyetTarihi = document.getElementById('mezuniyetTarihiEkle').value;

    const response = await fetch('/diplomaEkle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcNo, ad, soyad, kurumId, mezuniyetTarihi })
    });
    const result = await response.json();
    alert(result.message);
});

document.getElementById('diplomaOnaylaForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const tcNo = document.getElementById('tcNoOnayla').value;

    const response = await fetch('/diplomaOnayla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcNo })
    });
    const result = await response.json();
    alert(result.message);
});

document.getElementById('diplomaSorgulaForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const tcNo = document.getElementById('tcNoSorgula').value;

    const response = await fetch(`/diplomaSorgula/${tcNo}`);
    const result = await response.json();
    const sonucDiv = document.getElementById('diplomaSonuc');
    if (result.success) {
        sonucDiv.innerHTML = `
            <p>TC No: ${result.TcNo}</p>
            <p>Ad: ${result.Ad}</p>
            <p>Soyad: ${result.Soyad}</p>
            <p>Kurum ID: ${result.KurumId}</p>
            <p>Mezuniyet Tarihi: ${result.MezuniyetTarihi}</p>
            <p>Durum: ${result.isState}</p>
        `;
    } else {
        sonucDiv.innerHTML = `<p>${result.message}</p>`;
    }
});
