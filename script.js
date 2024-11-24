document.getElementById('investorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        condition: formData.get('condition'),
        date: formData.get('date')
    };

    // For now, just show the data in an alert
    alert('הטופס נשלח בהצלחה!\n\n' + 
          'שם: ' + data.fullName + '\n' +
          'דואל: ' + data.email + '\n' +
          'תנאי: ' + data.condition + '\n' +
          'תאריך: ' + data.date);

    // Later we can add actual form submission to a server
    this.reset();
});