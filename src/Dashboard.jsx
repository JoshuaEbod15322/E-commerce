// src/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import { signOut, getCurrentUser } from "@/lib/supabase";
import { getProducts, getBrands, getCategories } from "@/lib/products";
import { getCartItems, addToCart } from "@/lib/cart";
import ProductModal from "./ProductModal";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products separately
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  // Memoized load function
  const loadInitialData = useCallback(async () => {
    try {
      console.log("Starting dashboard data load...");
      setLoading(true);
      setLoadError(null);

      // Get current user with timeout
      const currentUser = await Promise.race([
        getCurrentUser(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("User load timeout")), 5000)
        ),
      ]);

      if (!currentUser) {
        console.warn("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      setUser(currentUser);
      console.log("User loaded:", currentUser.email);

      // Load data in parallel with timeouts
      const loadData = async () => {
        try {
          const [brandsData, categoriesData, productsData] = await Promise.all([
            getBrands().catch((err) => {
              console.warn("Brands load warning:", err);
              return [];
            }),
            getCategories().catch((err) => {
              console.warn("Categories load warning:", err);
              return [];
            }),
            getProducts().catch((err) => {
              console.warn("Products load warning:", err);
              return [];
            }),
          ]);

          setBrands(brandsData);
          setCategories(categoriesData);

          // Store all products
          setAllProducts(productsData || []);

          // Sort all products by date initially
          const sortedProducts = (productsData || []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          setProducts(sortedProducts);

          // Load cart count if user is logged in
          if (currentUser?.id) {
            try {
              const cartItems = await getCartItems(currentUser.id);
              setCartCount(cartItems?.length || 0);
            } catch (cartError) {
              console.warn("Cart load warning:", cartError);
            }
          }

          console.log("Dashboard data loaded successfully");
        } catch (error) {
          console.error("Data load error:", error);
          throw error;
        }
      };

      await loadData();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoadError(error.message);

      // If it's a timeout, try a lighter load
      if (error.message.includes("timeout")) {
        console.log("Timeout occurred, trying lighter load...");
        try {
          const minimalProducts = await getProducts();
          setProducts(minimalProducts || []);
          setAllProducts(minimalProducts || []);
        } catch (minimalError) {
          console.error("Minimal load also failed:", minimalError);
        }
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadInitialData();

    // Set up refresh listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !initialLoad) {
        console.log("Page became visible, refreshing cart count...");
        refreshCartCount();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadInitialData, initialLoad]);

  // Effect for filtering products locally when category/brand is selected
  useEffect(() => {
    if (!selectedCategory && !selectedBrand && !searchQuery) {
      // No filters, show all products sorted by date
      const sortedProducts = [...allProducts].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setProducts(sortedProducts);
      return;
    }

    // Apply local filtering
    let filteredProducts = [...allProducts];

    // Filter by category
    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(
        (product) => product.categories?.name === selectedCategory
      );
    }

    // Filter by brand
    if (selectedBrand) {
      filteredProducts = filteredProducts.filter(
        (product) => product.brands?.name === selectedBrand
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brands?.name.toLowerCase().includes(query) ||
          product.categories?.name.toLowerCase().includes(query)
      );
    }

    // Don't sort filtered results
    setProducts(filteredProducts);
  }, [selectedCategory, selectedBrand, searchQuery, allProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (selectedCategory) filters.category = selectedCategory;
      if (selectedBrand) filters.brand = selectedBrand;
      if (searchQuery) filters.search = searchQuery;

      // Only fetch from API if we have search query (for better search results)
      // For category/brand filters, use local filtering
      if (searchQuery) {
        const productsData = await getProducts(filters);
        setProducts(productsData || []);
      } else {
        // Use local filtering for category/brand
        // This ensures immediate response
        let filteredProducts = [...allProducts];

        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            (product) => product.categories?.name === selectedCategory
          );
        }

        if (selectedBrand) {
          filteredProducts = filteredProducts.filter(
            (product) => product.brands?.name === selectedBrand
          );
        }

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logout initiated");
      await signOut();
      // signOut function now handles redirect
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
      window.location.href = "/login";
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
    setIsMobileMenuOpen(false);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedCategory(null);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await fetchProducts();
    }
  };

  const handleOpenProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || "");
    setQuantity(1);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    setSelectedSize("");
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedProduct) return;

    try {
      setCartLoading(true);
      await addToCart(
        user.id,
        selectedProduct.id,
        quantity,
        selectedSize || null
      );

      // Update cart count
      refreshCartCount();

      handleCloseProductModal();
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart: " + error.message);
    } finally {
      setCartLoading(false);
    }
  };

  const refreshCartCount = async () => {
    if (user?.id) {
      try {
        const cartItems = await getCartItems(user.id);
        setCartCount(cartItems?.length || 0);
      } catch (error) {
        console.warn("Failed to refresh cart count:", error);
      }
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery("");
    // Show all products sorted by date
    const sortedProducts = [...allProducts].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    setProducts(sortedProducts);
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleRetryLoad = () => {
    setLoadError(null);
    loadInitialData();
  };

  // Error state
  if (loadError && initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryLoad}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <ShoppingBag className="absolute inset-0 m-auto h-10 w-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">
            Loading Dashboard
          </h2>
          <p className="mt-2 text-gray-500">
            Preparing your shopping experience...
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Taking too long? Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation - Updated logout */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 no-underline"
            >
              <span className="text-xl font-bold text-neutral-900">
                DrinksCart
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/dashboard"
                className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors"
              >
                Home
              </Link>

              {/* Brand Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-1 focus:outline-none bg-white">
                    Brand
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 border border-neutral-200 shadow-lg bg-white">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => {
                      setSelectedBrand(null);
                      setSelectedCategory(null);
                    }}
                  >
                    All Brands
                  </DropdownMenuItem>
                  {brands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      className="cursor-pointer hover:bg-neutral-100 bg-white"
                      onClick={() => handleBrandSelect(brand.name)}
                    >
                      {brand.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-1 focus:outline-none bg-white">
                    Category
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 border border-neutral-200 shadow-lg bg-white">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedBrand(null);
                    }}
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      className="cursor-pointer hover:bg-neutral-100 bg-white"
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10 w-64 border-neutral-300 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Account */}
              <Link
                to="/account"
                className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors hidden md:flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Account
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors hidden md:flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Cart - Mobile */}
              <Link
                to="/cart"
                className="md:hidden relative p-2 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-neutral-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Settings Dropdown - Updated logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none">
                    <Settings className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 border border-neutral-200 shadow-lg bg-white">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-red-50 bg-white text-red-600 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 py-4">
              <div className="flex flex-col space-y-4">
                <form onSubmit={handleSearch} className="px-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-10 w-full border-neutral-300 bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>

                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="text-neutral-700 hover:text-neutral-900 font-medium py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>

                  <Link
                    to="/account"
                    className="text-neutral-700 hover:text-neutral-900 font-medium py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Account
                  </Link>

                  <Link
                    to="/cart"
                    className="text-neutral-700 hover:text-neutral-900 font-medium py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-2 relative"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute left-24 top-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <div className="space-y-1 pt-2">
                    <span className="text-neutral-700 font-medium py-3 px-4 block">
                      Brand
                    </span>
                    <div className="pl-6 space-y-1">
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => {
                          setSelectedBrand(null);
                          setSelectedCategory(null);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        All Brands
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                          onClick={() => handleBrandSelect(brand.name)}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-700 font-medium py-3 px-4 block">
                      Category
                    </span>
                    <div className="pl-6 space-y-1">
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedBrand(null);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                          onClick={() => handleCategorySelect(category.name)}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    className="text-red-600 hover:text-red-700 font-medium py-3 px-4 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2 text-left mt-4"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-neutral-600 to-neutral-800 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Grab up to 50% off on selected tumbler
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Limited time offer. Shop now before it's too late!
            </p>
            <Button
              className="bg-white text-neutral-900 hover:bg-neutral-100 text-lg px-8 py-6 font-semibold"
              onClick={() => navigate("/dashboard")}
            >
              Buy now
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">
            Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedBrand(null);
              }}
              className={`bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer ${
                !selectedCategory ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <h3 className="font-semibold text-neutral-900 text-lg">
                All Categories
              </h3>
              <p className="text-sm text-neutral-600 mt-2">View all products</p>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.name)}
                className={`bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  selectedCategory === category.name
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <h3 className="font-semibold text-neutral-900 text-lg">
                  {category.name}
                </h3>
                <p className="text-sm text-neutral-600 mt-2">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">
              {selectedCategory
                ? `${selectedCategory} Products (${products.length})`
                : selectedBrand
                ? `${selectedBrand} Products (${products.length})`
                : `Featured Products (${products.length})`}
            </h2>

            {/* Clear filters button */}
            {(selectedCategory || selectedBrand || searchQuery) && (
              <Button
                variant="outline"
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-neutral-600 mt-4">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No products found
              </h3>
              <p className="text-neutral-500 mb-4">
                {selectedCategory || selectedBrand || searchQuery
                  ? "No products match your filters"
                  : "No products available at the moment"}
              </p>
              {(selectedCategory || selectedBrand || searchQuery) && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  {product.images?.[0] ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-neutral-100 flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-neutral-400" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-lg mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-neutral-600">
                            {product.brands?.name}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {product.categories?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-4 line-clamp-2">
                      {product.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xl font-bold text-neutral-800">
                        P{product.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-neutral-600">
                        Stock: {product.stock}
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        className="w-full bg-neutral-600 hover:bg-neutral-700 text-white font-semibold"
                        onClick={() => handleOpenProductModal(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Buy"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {isProductModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm"
            onClick={handleCloseProductModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-neutral-600">
                      {selectedProduct.brands?.name}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedProduct.categories?.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseProductModal}
                  className="text-neutral-500 hover:text-neutral-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div>
                  {selectedProduct.images?.[0] ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-64 bg-neutral-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <ShoppingBag className="h-20 w-20 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div>
                  <p className="text-neutral-600 mb-6">
                    {selectedProduct.description || "No description available"}
                  </p>

                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-900 mb-2">
                      Choose a Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes?.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded border transition-colors ${
                            selectedSize === size
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-neutral-700 border-neutral-300 hover:border-blue-500 hover:bg-blue-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                      {(!selectedProduct.sizes ||
                        selectedProduct.sizes.length === 0) && (
                        <span className="text-neutral-500">
                          No sizes available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-900 mb-2">
                      Quantity
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-semibold">{quantity}</span>
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= selectedProduct.stock}
                        className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-neutral-600">
                        Available: {selectedProduct.stock}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-2xl font-bold text-neutral-900">
                          P{(selectedProduct.price * quantity).toFixed(2)}
                        </div>
                        <div className="text-neutral-600">
                          {quantity} × P{selectedProduct.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full py-3 text-md bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800 text-white"
                      onClick={handleAddToCart}
                      disabled={selectedProduct.stock === 0 || cartLoading}
                    >
                      {cartLoading
                        ? "Adding to cart..."
                        : selectedProduct.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
