import axios from 'axios';

async function checkApi() {
  try {
    const res = await axios.get('http://localhost:8000/api/v1/Product/List?storeId=af38db84-46e2-4c03-9bd7-d0e76353cd35');
    console.log("API Response sample (first item):", res.data.data?.[0]);
  } catch (err) {
    console.error("API call failed:", err.message);
  }
}

checkApi();
