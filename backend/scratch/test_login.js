const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:8000/api/v1/auth/login', {
      email: 'admin@user.com',
      password: 'Login123!!'
    });
    console.log('Login Result:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Login Failed with Status:', err.response.status);
      console.log('Data:', err.response.data);
    } else {
      console.error('Request Error:', err.message);
    }
  }
}

testLogin();
