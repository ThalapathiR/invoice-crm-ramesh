const axios = require('axios');

async function verify() {
  try {
    console.log('--- Logging in ---');
    const loginRes = await axios.post('http://localhost:8000/api/v1/auth/login', {
      email: 'admin@user.com',
      password: 'Login123!!'
    });
    
    console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
    
    const token = loginRes.data.result.api_token;
    console.log('\n--- Calling /me endpoint with token ---');
    
    const meRes = await axios.get('http://localhost:8000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Me Response:', JSON.stringify(meRes.data, null, 2));
    console.log('\nSUCCESS: 401 issue resolved!');
    
  } catch (err) {
    if (err.response) {
      console.log('Error Status:', err.response.status);
      console.log('Error Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Request Error:', err.message);
    }
  }
}

verify();
