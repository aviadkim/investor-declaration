const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL'; // תחליף את זה עם ה-URL החדש שלך

document.addEventListener('DOMContentLoaded', function() {
    let signaturePad;
    const canvas = document.getElementById('signatureCanvas');
    const signatureFile = document.getElementById('signatureFile');
    
    // פונקציה לצילום הטופס
    async function captureForm() {
        try {
            console.log('Starting form capture...');
            const formElement = document.querySelector('.form-card');
            
            // הגדרות מיוחדות ל-html2canvas
            const canvas = await html2canvas(formElement, {
                scale: 2, // איכות גבוהה יותר
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: true,
                onrendered: function(canvas) {
                    console.log('Form captured successfully');
                    return canvas.toDataURL('image/png', 1.0);
                },
                onclone: function(documentClone) {
                    console.log('Document cloned for capture');
                }
            });
            
            console.log('Form capture completed');
            return canvas.toDataURL('image/png', 1.0);
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
            penColor: 'rgb(0, 0, 0)'
        });

        function resizeCanvas() {
            // הגדרת רזולוציה גבוהה יותר
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
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        document.getElementById('signatureData').value = canvas.toDataURL('image/png', 1.0);
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
            submitBtn.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';

            // צילום הטופס
            console.log('Capturing form...');
            const screenshot = await captureForm();
            console.log('Form captured');
            
            // קבלת החתימה
            const signature = !signaturePad.isEmpty() ? 
                signaturePad.toDataURL('image/png', 1.0) : 
                document.getElementById('signatureData').value;

            const formData = {
                firstName: document.querySelector('input[name="name"]').value,
                lastName: document.querySelector('input[name="last_name"]').value,
                idNumber: document.querySelector('input[name="id_number"]').value,
                phone: document.querySelector('input[name="phone"]').value,
                email: document.querySelector('input[name="email"]').value,
                condition: document.querySelector('input[name="condition"]:checked').value,
                date: document.querySelector('input[name="date"]').value,
                signature: signature,
                submitScreenshot: screenshot
            };

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