import React, { useState } from 'react';

const sampleProducts = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    sku: 'SKU001',
    barcode: '123456789012',
    price: 89.99,
    quantity: 3,
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Organic Coffee Beans',
    sku: 'SKU002',
    barcode: '987654321098',
    price: 24.99,
    quantity: 45,
    category: 'Food & Beverage'
  },
  {
    id: 3,
    name: 'Premium Yoga Mat',
    sku: 'SKU003',
    barcode: '456789123456',
    price: 39.99,
    quantity: 12,
    category: 'Fitness'
  },
  {
    id: 4,
    name: 'LED Desk Lamp',
    sku: 'SKU004',
    barcode: '789123456789',
    price: 59.99,
    quantity: 8,
    category: 'Home & Office'
  },
  {
    id: 5,
    name: 'Handcrafted Ceramic Mug',
    sku: 'SKU005',
    barcode: '321654987321',
    price: 15.99,
    quantity: 2,
    category: 'Home & Office'
  }
];

function ProductList() {
  const [products, setProducts] = useState(sampleProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const getQuantityStatus = (quantity) => {
    if (quantity <= 5) return 'quantity-low';
    if (quantity <= 15) return 'quantity-medium';
    return 'quantity-good';
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (id) => {
    alert(`Edit product with ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddProduct = () => {
    alert('Add Product functionality coming soon!');
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= 5).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  return (
    <div className="product-list-container">
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{lowStockProducts}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${totalValue.toFixed(2)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{products.filter(p => p.quantity === 0).length}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
      </div>

      {/* Product List Header */}
      <div className="product-list-header">
        <h2 className="product-list-title">📋 Product Inventory</h2>
        <button className="add-product-btn" onClick={handleAddProduct}>➕ Add New Product</button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search products, SKU, or category..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            width: '100%',
            padding: '12px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '25px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* Product Table */}
      <table className="product-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
              Product Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('sku')} style={{ cursor: 'pointer' }}>
              SKU {sortBy === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Barcode</th>
            <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
              Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
              Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>
              Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedProducts.map(product => (
            <tr key={product.id}>
              <td>
                <strong>{product.name}</strong>
              </td>
              <td>
                <code>{product.sku}</code>
              </td>
              <td>
                <small>{product.barcode}</small>
              </td>
              <td>
                <span style={{ 
                  background: '#e2e8f0', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem' 
                }}>
                  {product.category}
                </span>
              </td>
              <td>
                <strong>${product.price.toFixed(2)}</strong>
              </td>
              <td>
                <span className={getQuantityStatus(product.quantity)}>
                  {product.quantity} {product.quantity <= 5 && '⚠️'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => handleEdit(product.id)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(product.id)}>🗑️ Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredAndSortedProducts.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#718096',
          fontSize: '1.1rem'
        }}>
          🔍 No products found matching your search criteria
        </div>
      )}
    </div>
  );
}

export default ProductList; 