// AdminDashboard.jsx
import React, { useState } from "react";
import ProductModal from "./ProductModal";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Tesleb Bubled",
      category: "Stainless",
      brand: "AquaFlask",
      price: "P150",
      stock: 56,
      sizes: ["500ml", "1L"],
      description: "High-quality stainless steel water bottle",
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderId: "ORD-001",
      customer: "John Doe",
      product: "Tesleb Bubled",
      category: "Stainless",
      date: "Jan 20, 2025",
      price: "P150",
      status: "Delivered",
    },
    {
      id: 2,
      orderId: "ORD-002",
      customer: "Jane Smith",
      product: "Hydro Bottle",
      category: "Plastic",
      date: "Jan 21, 2025",
      price: "P100",
      status: "Pending",
    },
  ]);

  const [editingProduct, setEditingProduct] = useState(null);

  // Mock data for demonstration
  const totalSales = "P2,500";
  const totalOrders = 20;
  const totalCustomers = 100;

  const categories = ["Stainless", "Plastic", "Glass", "Ceramic", "Other"];
  const brands = [
    "AquaFlask",
    "Hydroflask",
    "Stanley",
    "Yeti",
    "Nalgene",
    "Generic",
  ];
  const sizeOptions = ["500ml", "750ml", "1L", "1.5L", "2L"];
  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = (productData) => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? {
                ...editingProduct,
                ...productData,
                stock: parseInt(productData.stock) || 0,
              }
            : product
        )
      );
    } else {
      // Create new product object
      const productToAdd = {
        id: products.length + 1,
        name: productData.name,
        category: productData.category,
        brand: productData.brand,
        price: productData.price,
        stock: parseInt(productData.stock) || 0,
        sizes: productData.sizes || [],
        description: productData.description || "",
      };

      // Add to products list
      setProducts([...products, productToAdd]);
    }

    // Close modal
    handleCloseModal();
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== productId));
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-value">{totalCustomers}</p>
        </div>
      </div>

      <div className="management-tabs">
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => handleTabChange("products")}
        >
          Product Management
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => handleTabChange("orders")}
        >
          Order Management
        </button>
      </div>

      <div className="management-content">
        {activeTab === "products" && (
          <div className="products-section">
            <div className="section-header">
              <h2>Product Management</h2>
              <button className="add-btn" onClick={handleAddProduct}>
                + Add New Product
              </button>
            </div>

            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sizes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id.toString().padStart(3, "0")}</td>
                      <td>{product.name}</td>
                      <td>
                        <span className="category-badge">
                          {product.category}
                        </span>
                      </td>
                      <td>{product.brand}</td>
                      <td>{product.price}</td>
                      <td>
                        <span
                          className={`stock-badge ${
                            product.stock > 10 ? "in-stock" : "low-stock"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        {product.sizes && product.sizes.length > 0
                          ? product.sizes.join(", ")
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Order Management</h2>
            </div>

            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderId}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.category}</td>
                      <td>{order.date}</td>
                      <td>{order.price}</td>
                      <td>
                        <span
                          className={`status-badge status-${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="order-actions">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="status-select"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button className="action-btn view-btn">
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
        categories={categories}
        brands={brands}
        sizeOptions={sizeOptions}
      />
    </div>
  );
};

export default AdminDashboard;
