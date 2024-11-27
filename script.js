// URL של Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyo5OA9GKLwhP3fhZJZ1PwrZ5ellteOfhYcUK3GBLaC72UXE7hW8HcbUbV71b40tbKp/exec';

document.addEventListener('DOMContentLoaded', function() {
    let signaturePad;
    const canvas = document.getElementById('signatureCanvas');
    const signatureFile = document.getElementById('signatureFile');
    
    // פונקציה לצילום הטופס
    async function captureForm(reason) {
        try {
            const formElement = document.querySelector('.form-card');
            // שינוי הגדרות ל-html2canvas
            const canvas = await html2canvas(formElement, {
                useCORS: true,
                allowTaint: true,
                scrollY: -window.scrollY,
                backgroundColor: '#ffffff',
                scale: 2 // איכות טובה יותר
            });
            
            const screenshot = canvas.toDataURL('image/jpeg', 1.0); // שימוש ב-JPEG באיכות מקסימלית
            
            if (reason === 'submit') {
                document.getElementById('submitScreenshot').value = screenshot;
            }
            
            return screenshot;
        } catch (error) {
            console.error('Error capturing form:', error);
            return null;
        }
    }

    if (canvas) {
        console.log('Initializing signature pad...');
        signaturePad = new SignaturePad(canvas, {
            minWidth: 1,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            throttle: 0,
            velocityFilterWeight: 0.7
        });

        function resizeCanvas() {
            const ctx = canvas.getContext('2d');
            
            // שמירת התוכן הקיים
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx.drawImage(canvas, 0, 0);
            
            // התאמת גודל
            canvas.width = canvas.offsetWidth * 2; // הכפלת הרזולוציה
            canvas.height = canvas.offsetHeight * 2;
            
            // החזרת התוכן בגודל החדש
            ctx.scale(2, 2);
            ctx.drawImage(tempCanvas, 0, 0);
            
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
                        
                        // שיפור איכות התמונה המועלית
                        canvas.width = img.width * 2;
                        canvas.height = img.height * 2;
                        ctx.scale(2, 2);
                        ctx.drawImage(img, 0, 0);
                        
                        document.getElementById('signatureData').value = canvas.toDataURL('image/jpeg', 1.0);
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

        try {
            // עדכון החתימה
            if (!signaturePad.isEmpty()) {
                const signatureCanvas = document.getElementById('signatureCanvas');
                const signatureData = signatureCanvas.toDataURL('image/jpeg', 1.0);
                document.getElementById('signatureData').value = signatureData;
                console.log('Signature captured');
            }

            // צילום הטופס
            const screenshot = await captureForm('submit');
            console.log('Form captured');

            const formData = {
                firstName: document.querySelector('input[name="name"]').value,
                lastName: document.querySelector('input[name="last_name"]').value,
                idNumber: document.querySelector('input[name="id_number"]').value,
                phone: document.querySelector('input[name="phone"]').value,
                email: document.querySelector('input[name="email"]').value,
                condition: document.querySelector('input[name="condition"]:checked').value,
                date: document.querySelector('input[name="date"]').value,
                signature: document.getElementById('signatureData').value,
                submitScreenshot: screenshot
            };

            // עדכון ממשק המשתמש
            submitBtn.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';

            // שליחה לשרת
            console.log('Sending data to server...');
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',
                body: JSON.stringify(formData)
            });

            console.log('Form submitted successfully');
            window.location.href = '/thanks';
        } catch (error) {
            console.error('Error:', error);
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