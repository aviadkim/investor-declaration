document.addEventListener('DOMContentLoaded', function() {
    // יצירת לוח החתימה
    const canvas = document.getElementById('signatureCanvas');
    const signaturePad = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 2.5,
        backgroundColor: 'white'
    });

    // התאמת גודל הקנבס
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ניקוי החתימה
    document.getElementById('clearSignature').addEventListener('click', () => {
        signaturePad.clear();
        document.getElementById('signatureData').value = '';
    });

    // העלאת קובץ חתימה
    document.getElementById('uploadSignatureBtn').addEventListener('click', () => {
        document.getElementById('uploadSignature').click();
    });

    document.getElementById('uploadSignature').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    document.getElementById('signatureData').value = canvas.toDataURL();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // טיפול בשליחת הטופס
    document.getElementById('investorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (signaturePad.isEmpty()) {
            alert('נא להוסיף חתימה');
            return;
        }

        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.querySelector('.button-text').textContent = 'שולח...';
        submitBtn.querySelector('.button-loader').style.display = 'block';
        
        const formData = new FormData(this);
        formData.append('signature', signaturePad.toDataURL());

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (response.ok) {
                showToast('הטופס נשלח בהצלחה! צוות מובנה יצור איתך קשר בהקדם', 'success');
                this.reset();
                signaturePad.clear();
            } else {
                throw new Error('שגיאה בשליחת הטופס');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('שגיאה בשליחת הטופס. אנא נסה שוב', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('.button-text').textContent = 'שלח הצהרה';
            submitBtn.querySelector('.button-loader').style.display = 'none';
        }
    });
});

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}