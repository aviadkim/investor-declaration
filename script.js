document.addEventListener('DOMContentLoaded', function() {
    let signaturePad;
    
    const canvas = document.getElementById('signatureCanvas');
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
    }

    document.getElementById('investorForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (signaturePad && signaturePad.isEmpty()) {
            showToast('נא להוסיף חתימה', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const buttonText = submitBtn.querySelector('.button-text');
        const buttonLoader = submitBtn.querySelector('.button-loader');

        submitBtn.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            if (signaturePad) {
                data.signature = signaturePad.toDataURL();
            }

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('שגיאה בשליחת הטופס');
            }

            showToast('הטופס נשלח בהצלחה! צוות מובנה יצור איתך קשר בהקדם', 'success');
            this.reset();
            if (signaturePad) {
                signaturePad.clear();
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('שגיאה בשליחת הטופס. אנא נסה שוב', 'error');
        } finally {
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

document.querySelector('input[name="idNumber"]').addEventListener('input', function(e) {
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