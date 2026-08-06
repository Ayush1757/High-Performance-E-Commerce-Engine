import http from 'http';

function testProductsEndpoint() {
  console.log('Testing GET http://localhost:5000/api/products...');
  http.get('http://localhost:5000/api/products?page=1&limit=8', (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Raw Response:', data.substring(0, 500));
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('HTTP Request Failed:', err.message);
    process.exit(1);
  });
}

testProductsEndpoint();
