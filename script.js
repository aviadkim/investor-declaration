document.getElementById('investorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    const formData = new FormData(this);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        idNumber: formData.get('idNumber'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        condition: formData.get('condition'),
        date: formData.get('date'),
        signature: formData.get('signature')
    };

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('הטופס נשלח בהצלחה! צוות מובנה יצור איתך קשר בהקדם', 'success');
            this.reset();
        } else {
            throw new Error('שגיאה בשליחת הטופס');
        }
    } catch (error) {
        showToast('שגיאה בשליחת הטופס. אנא נסה שוב', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Validate ID number length
document.querySelector('input[name="idNumber"]').addEventListener('input', function(e) {
    if (this.value.length > 9) {
        this.value = this.value.slice(0, 9);
    }
});

// Format phone number
document.querySelector('input[name="phone"]').addEventListener('input', function(e) {
    let phone = this.value.replace(/\D/g, '');
    if (phone.length > 3) {
        phone = phone.slice(0, 3) + '-' + phone.slice(3);
    }
    this.value = phone;
});