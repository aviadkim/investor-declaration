document.addEventListener('DOMContentLoaded', function() {
    // אתחול EmailJS עם המפתח הציבורי שלך
    emailjs.init("7Grj0WpTT2VWLNhLL");
    
    let signaturePad;
    const canvas = document.getElementById('signatureCanvas');
    const signatureFile = document.getElementById('signatureFile');
    
    if (canvas) {
        signaturePad = new SignaturePad(canvas, {
            minWidth: 1,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)'
        });

        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear();
        }

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        document.getElementById('clearSignature').addEventListener('click', () => {
            signaturePad.clear();
            document.getElementById('signatureData').value = '';
        });

        signatureFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        
                        const scale = Math.min(
                            canvas.width / img.width,
                            canvas.height / img.height
                        ) * 0.8;
                        
                        const x = (canvas.width - img.width * scale) / 2;
                        const y = (canvas.height - img.height * scale) / 2;
                        
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                        document.getElementById('signatureData').value = canvas.toDataURL('image/jpeg', 0.5);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    document.getElementById('investorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submission started');

        if (signaturePad && signaturePad.isEmpty() && !document.getElementById('signatureData').value) {
            showToast('נא להוסיף חתימה או להעלות קובץ חתימה', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const buttonText = submitBtn.querySelector('.button-text');
        const buttonLoader = submitBtn.querySelector('.button-loader');

        // עדכון החתימה אם יש
        if (!signaturePad.isEmpty()) {
            document.getElementById('signatureData').value = signaturePad.toDataURL('image/jpeg', 0.5);
        }

        // הכנת הנתונים לשליחה
        const formData = {
            to_name: "מובנה",
            from_name: document.querySelector('input[name="name"]').value + " " + document.querySelector('input[name="last_name"]').value,
            name: document.querySelector('input[name="name"]').value,
            last_name: document.querySelector('input[name="last_name"]').value,
            id_number: document.querySelector('input[name="id_number"]').value,
            phone: document.querySelector('input[name="phone"]').value,
            email: document.querySelector('input[name="email"]').value,
            condition: document.querySelector('input[name="condition"]:checked').value,
            date: document.querySelector('input[name="date"]').value,
            signature: document.getElementById('signatureData').value,
            reply_to: document.querySelector('input[name="email"]').value
        };

        console.log('Form data prepared', { 
            formDataKeys: Object.keys(formData),
            serviceId: 'service_we6e19s',
            templateId: 'template_1snuekk'
        });

        // עדכון ממשק המשתמש לפני השליחה
        submitBtn.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        try {
            console.log('Attempting to send email...');
            const response = await emailjs.send(
                "service_we6e19s",
                "template_1snuekk",
                formData
            );

            console.log("SUCCESS!", { status: response.status, text: response.text });
            window.location.href = 'https://investor-declaration-production.up.railway.app/thanks';
        } catch (error) {
            console.error("FAILED...", { 
                error: error,
                errorMessage: error.message,
                errorText: error.text,
                errorStack: error.stack
            });
            showToast('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.', 'error');
            
            submitBtn.disabled = false;
            buttonText.style.opacity = '1';
            buttonLoader.style.display = 'none';
        }
    });
});

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.className = 'toast';
    toast.textContent = message;
    toast.classList.add(type);
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

document.querySelector('input[name="id_number"]').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
    if (this.value.length > 9) {
        this.value = this.value.slice(0, 9);
    }
});

document.querySelector('input[name="phone"]').addEventListener('input', function(e) {
    let phone = this.value.replace(/\D/g, '');
    if (phone.length > 3) {
        phone = phone.slice(0, 3) + '-' + phone.slice(3);
    }
    this.value = phone;
});