const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL'; // תחליף את זה עם ה-URL שלך

document.addEventListener('DOMContentLoaded', function() {
    let signaturePad;
    const canvas = document.getElementById('signatureCanvas');
    const signatureFile = document.getElementById('signatureFile');
    
    // פונקציה ליצירת PDF
    async function generatePDF(formData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // הוספת הלוגו
        const logo = document.querySelector('.logo');
        if (logo) {
            const logoCanvas = await html2canvas(logo);
            const logoData = logoCanvas.toDataURL('image/png');
            doc.addImage(logoData, 'PNG', 10, 10, 30, 30);
        }
        
        // הוספת תוכן הטופס
        doc.setFont('Arial');
        doc.setFontSize(18);
        doc.text('הצהרת משקיע כשיר - מובנה', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`שם מלא: ${formData.firstName} ${formData.lastName}`, 190, 40, { align: 'right' });
        doc.text(`תעודת זהות: ${formData.idNumber}`, 190, 50, { align: 'right' });
        doc.text(`טלפון: ${formData.phone}`, 190, 60, { align: 'right' });
        doc.text(`דוא"ל: ${formData.email}`, 190, 70, { align: 'right' });
        doc.text(`תנאי כשירות שנבחר: ${formData.condition}`, 190, 80, { align: 'right' });
        doc.text(`תאריך: ${formData.date}`, 190, 90, { align: 'right' });
        
        // הוספת החתימה
        if (formData.signature) {
            doc.addImage(formData.signature, 'PNG', 130, 100, 60, 30);
            doc.text('חתימה:', 190, 100, { align: 'right' });
        }
        
        return doc.output('blob');
    }
    
    // פונקציה לצילום הטופס
    async function captureForm() {
        try {
            const formElement = document.querySelector('.form-card');
            const canvas = await html2canvas(formElement, {
                scale: 2,
                useCORS: true,
                logging: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            return canvas.toDataURL('image/png', 1.0);
        } catch (error) {
            console.error('Error capturing form:', error);
            return null;
        }
    }
    
    if (canvas) {
        signaturePad = new SignaturePad(canvas, {
            minWidth: 1,
            maxWidth: 2.5,
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
        
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);
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
                submitScreenshot: await captureForm()
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