// src/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductModal from "./ProductModal";
import ErrorBoundary from "./ErrorBoundary";
import { signOut, getDashboardStats, supabase } from "@/lib/supabase";
import {
  getProducts,
  getBrands,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalSales: "₱0.00",
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();

    // Add event listener for page visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Admin dashboard became visible, refreshing...");
        // Refresh only critical data
        refreshStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      console.log("Starting to load admin dashboard data...");

      // Load data with timeouts
      const loadPromises = [
        getDashboardStats().catch((err) => {
          console.error("Error loading stats:", err);
          return { totalSales: "₱0.00", totalOrders: 0, totalCustomers: 0 };
        }),
        getProducts().catch((err) => {
          console.error("Error loading products:", err);
          return [];
        }),
        getAllOrders().catch((err) => {
          console.error("Error loading orders:", err);
          return [];
        }),
        getBrands().catch((err) => {
          console.error("Error loading brands:", err);
          return [];
        }),
        getCategories().catch((err) => {
          console.error("Error loading categories:", err);
          return [];
        }),
      ];

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Dashboard load timeout")), 10000)
      );

      const [
        dashboardStats,
        productsData,
        ordersData,
        brandsData,
        categoriesData,
      ] = await Promise.race([Promise.all(loadPromises), timeoutPromise]);

      console.log("Admin data loaded successfully");

      setStats(dashboardStats);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setBrands(brandsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Unexpected error loading dashboard data:", error);
      setLoadError(error.message);

      // Try to load at least some data
      try {
        const minimalProducts = await getProducts();
        setProducts(minimalProducts || []);
      } catch (minimalError) {
        console.error("Minimal load also failed:", minimalError);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.warn("Failed to refresh stats:", error);
    }
  };

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

  const handleSubmitProduct = async (productData) => {
    try {
      // Extract values from FormData
      const name = productData.get("name");
      const description = productData.get("description");
      const price = productData.get("price");
      const stock = productData.get("stock");
      const category = productData.get("category");
      const brand = productData.get("brand");
      const is_featured = productData.get("is_featured") === "true";
      const sizes = JSON.parse(productData.get("sizes") || "[]");
      const image = productData.get("image");
      const existing_image = productData.get("existing_image");

      // Validate required fields
      if (!name || !price || !category || !brand) {
        alert("Missing required fields");
        return;
      }

      // Find brand and category IDs
      const brandObj = brands.find((b) => b.name === brand);
      const categoryObj = categories.find((c) => c.name === category);

      if (!brandObj || !categoryObj) {
        alert("Invalid brand or category selected");
        return;
      }

      // Handle image upload if new image is provided
      let imageUrls = [];
      if (image && image instanceof File) {
        setUploading(true);
        // Upload to Supabase storage
        const fileName = `${Date.now()}-${image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, image);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        imageUrls = [publicUrl];
      } else if (existing_image) {
        // Use existing image
        imageUrls = [existing_image];
      }

      const productPayload = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        brand_id: brandObj.id,
        category_id: categoryObj.id,
        sizes,
        featured: is_featured,
        images: imageUrls,
      };

      if (editingProduct) {
        const updatedProduct = await updateProduct(
          editingProduct.id,
          productPayload
        );
        setProducts(
          products.map((product) =>
            product.id === editingProduct.id ? updatedProduct : product
          )
        );
      } else {
        const newProduct = await createProduct(productPayload);
        setProducts([...products, newProduct]);
      }

      handleCloseModal();
      alert("Product saved successfully!");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter((product) => product.id !== productId));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // signOut function handles redirect
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect
      window.location.href = "/login";
    }
  };

  const handleRetryLoad = () => {
    setLoadError(null);
    loadDashboardData();
  };

  const orderStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const sizeOptions = ["500ml", "750ml", "1L", "1.5L", "2L"];

  if (loadError) {
    return (
      <div className="admin-dashboard">
        <div className="error-screen">
          <h2>⚠️ Failed to Load Admin Dashboard</h2>
          <p>{loadError}</p>
          <div className="error-actions">
            <button onClick={handleRetryLoad} className="retry-btn">
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="refresh-btn"
            >
              Refresh Page
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
          <p className="loading-subtext">This may take a moment</p>
          <button
            onClick={() => window.location.reload()}
            className="loading-timeout-btn"
          >
            Taking too long? Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{stats.totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-value">{stats.totalCustomers}</p>
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
              {products.length === 0 ? (
                <div className="empty-state">
                  <p>No products found. Add your first product!</p>
                </div>
              ) : (
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
                        <td>#{product.id.substring(0, 8)}</td>
                        <td>{product.name}</td>
                        <td>
                          <span className="category-badge">
                            {product.categories?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td>{product.brands?.name || "Unbranded"}</td>
                        <td>₱{product.price?.toFixed(2)}</td>
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
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Order Management</h2>
            </div>

            <div className="table-container">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <p>No orders found.</p>
                </div>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{order.customer_name || "N/A"}</td>
                        <td>{order.customer_email || "N/A"}</td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          ₱{parseFloat(order.total_amount || 0).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${(
                              order.status || ""
                            ).toLowerCase()}`}
                          >
                            {(order.status || "pending")
                              .charAt(0)
                              .toUpperCase() +
                              (order.status || "pending").slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="order-actions">
                            <select
                              value={order.status || "pending"}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value
                                )
                              }
                              className="status-select"
                            >
                              {orderStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </option>
                              ))}
                            </select>
                            <button
                              className="action-btn view-btn"
                              onClick={() =>
                                alert(`Order details: ${order.order_number}`)
                              }
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wrap ProductModal with ErrorBoundary for safety */}
      <ErrorBoundary>
        {isModalOpen && (
          <ProductModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitProduct}
            product={editingProduct}
            categories={categories.map((c) => c.name)}
            brands={brands.map((b) => b.name)}
            sizeOptions={sizeOptions}
            uploading={uploading}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default AdminDashboard;
