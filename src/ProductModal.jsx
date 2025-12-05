// src/ProductModal.jsx
import React, { useState, useEffect } from "react";
import "./ProductModal.css";

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories = [],
  brands = [],
  sizeOptions = [],
  uploading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    sizes: [],
    image: null,
    imagePreview: "",
    is_featured: false,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
  };

  const handleSizeChange = (size) => {
    setFormData((prev) => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.price ||
      !formData.category ||
      !formData.brand
    ) {
      alert(
        "Please fill in all required fields (Name, Price, Category, Brand)"
      );
      return;
    }

    // Validate price is positive
    if (parseFloat(formData.price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    // Create FormData object for file upload
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description || "");
    submitData.append("price", parseFloat(formData.price));
    submitData.append("stock", parseInt(formData.stock) || 0);
    submitData.append("category", formData.category);
    submitData.append("brand", formData.brand);
    submitData.append("is_featured", formData.is_featured);
    submitData.append("sizes", JSON.stringify(formData.sizes));

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    // If editing and no new image but had previous image
    if (product && product.image_url && !formData.image) {
      submitData.append("existing_image", product.image_url);
    }

    onSubmit(submitData);
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        category: product.categories?.name || product.category || "",
        brand: product.brands?.name || product.brand || "",
        sizes: product.sizes || [],
        image: null,
        imagePreview: product.image_url || "",
        is_featured: product.featured || product.is_featured || false,
      });
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        brand: "",
        sizes: [],
        image: null,
        imagePreview: "",
        is_featured: false,
      });
    }
  }, [product]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? "Edit Product" : "Add New Product"}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₱) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand *</label>
              <select
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Brand</option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Available Sizes</label>
              <div className="size-buttons">
                {sizeOptions.map((size, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`size-btn ${
                      formData.sizes.includes(size) ? "selected" : ""
                    }`}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload-container">
              {formData.imagePreview ? (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="upload-area">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <div className="upload-icon">📁</div>
                    <span>Click to upload image</span>
                    <small>JPEG, PNG up to 5MB</small>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
              />
              <span>Featured Product</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={uploading}>
              {uploading
                ? "Uploading..."
                : product
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
