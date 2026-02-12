import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: false } // Can be filename or Base64 string
});

export default mongoose.model('Product', productSchema);

function getBase64FromFileInput(input, callback) {
  const file = input.files[0];
  if (!file) return callback('');
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

async function addProduct() {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const imageInput = document.getElementById('productImage');

  if (!name || !description || !price || !imageInput.files.length) {
    alert('Please fill in all required fields');
    return;
  }

  getBase64FromFileInput(imageInput, async (base64Image) => {
    try {
      const url = editingProductId 
        ? `${ADMIN_API}/product/${editingProductId}` 
        : `${ADMIN_API}/product`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description, price: parseFloat(price), image: base64Image })
      });

      if (res.ok) {
        alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
        document.getElementById('productName').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productPrice').value = '';
        imageInput.value = '';
        editingProductId = null;
        document.querySelector('.btn-primary').textContent = 'Add Product';
        loadProducts();
      } else {
        const error = await res.json();
        alert('Failed to save product: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
}
