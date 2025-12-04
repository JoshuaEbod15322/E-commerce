// Dashboard.jsx
import React, { useState } from "react";
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
} from "lucide-react";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Logged out successfully!");
    navigate("/login");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log(`Filtering by category: ${category}`);
    setIsMobileMenuOpen(false);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    console.log(`Filtering by brand: ${brand}`);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log(`Searching for: ${searchQuery}`);
      // Here you would search products from Supabase
      // Example: fetchProductsBySearch(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
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
              <Link
                to="/shop"
                className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors"
              >
                Shop
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
                    onClick={() => handleBrandSelect("Hydro Flask")}
                  >
                    Hydro Flask
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => handleBrandSelect("Yeti")}
                  >
                    Yeti
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => handleBrandSelect("Stanley")}
                  >
                    Stanley
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => handleBrandSelect("Corkcicle")}
                  >
                    Corkcicle
                  </DropdownMenuItem>
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
                    onClick={() => handleCategorySelect("Outdoor")}
                  >
                    Outdoor
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => handleCategorySelect("Stainless")}
                  >
                    Stainless
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => handleCategorySelect("Plastic")}
                  >
                    Plastic
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white"
                    onClick={() => handleCategorySelect("Accessories")}
                  >
                    Accessories
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Side - Search, Account, Cart, and Settings */}
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

              {/* Account - With icon */}
              <Link
                to="/account"
                className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors hidden md:flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Account
              </Link>

              {/* Cart - With text beside icon */}
              <Link
                to="/cart"
                className="text-neutral-700 hover:text-neutral-900 font-medium px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors hidden md:flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Cart - Mobile (icon only) */}
              <Link
                to="/cart"
                className="md:hidden relative p-2 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-neutral-700" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Settings Dropdown - Only logout option */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none">
                    <Settings className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 border border-neutral-200 shadow-lg bg-white">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-100 bg-white text-red-600 flex items-center gap-2"
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
                {/* Mobile Search Bar */}
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
                    to="/shop"
                    className="text-neutral-700 hover:text-neutral-900 font-medium py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>

                  {/* Account in Mobile */}
                  <Link
                    to="/account"
                    className="text-neutral-700 hover:text-neutral-900 font-medium py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Account
                  </Link>

                  {/* Cart in Mobile */}
                  <Link
                    to="/cart"
                    className="text-neutral-700 hover:text-neutral-900 font-medium py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-2 relative"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                    <span className="absolute left-24 top-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </Link>

                  <div className="space-y-1 pt-2">
                    <span className="text-neutral-700 font-medium py-3 px-4 block">
                      Brand
                    </span>
                    <div className="pl-6 space-y-1">
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleBrandSelect("Hydro Flask")}
                      >
                        Hydro Flask
                      </button>
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleBrandSelect("Yeti")}
                      >
                        Yeti
                      </button>
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleBrandSelect("Stanley")}
                      >
                        Stanley
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-700 font-medium py-3 px-4 block">
                      Category
                    </span>
                    <div className="pl-6 space-y-1">
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleCategorySelect("Outdoor")}
                      >
                        Outdoor
                      </button>
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleCategorySelect("Stainless")}
                      >
                        Stainless
                      </button>
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleCategorySelect("Plastic")}
                      >
                        Plastic
                      </button>
                      <button
                        className="text-neutral-600 hover:text-neutral-900 block py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors text-left w-full"
                        onClick={() => handleCategorySelect("Accessories")}
                      >
                        Accessories
                      </button>
                    </div>
                  </div>

                  {/* Logout in Mobile */}
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
            <Button className="bg-white text-neutral-900 hover:bg-neutral-100 text-lg px-8 py-6 font-semibold">
              Buy now
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section - These will filter products when clicked */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">
            Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleCategorySelect("Outdoor")}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-neutral-900 text-lg">
                Outdoor
              </h3>
            </button>
            <button
              onClick={() => handleCategorySelect("Stainless")}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-neutral-900 text-lg">
                Stainless
              </h3>
            </button>
            <button
              onClick={() => handleCategorySelect("Plastic")}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-neutral-900 text-lg">
                Plastic
              </h3>
            </button>
            <button
              onClick={() => handleCategorySelect("Accessories")}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-neutral-900 text-lg">
                Accessories
              </h3>
            </button>
          </div>
        </div>
      </section>

      {/* Products Section - Ready for Supabase integration */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">
              {selectedCategory
                ? `${selectedCategory} Products`
                : selectedBrand
                ? `${selectedBrand} Products`
                : "Featured Products"}
            </h2>

            {/* Clear filters button */}
            {(selectedCategory || selectedBrand) && (
              <Button
                variant="outline"
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setSearchQuery("");
                  console.log("Clearing filters, fetching all products");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Product grid will go here */}
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">
              {searchQuery
                ? `Search results for: "${searchQuery}"`
                : selectedCategory
                ? `Filtering by: ${selectedCategory}`
                : selectedBrand
                ? `Filtering by: ${selectedBrand}`
                : "All products"}
            </div>
            <p className="text-neutral-600 mb-8">
              Products will be loaded here from Supabase
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Example product cards - These will be replaced with Supabase data */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Product 1
                </h3>
                <p className="text-neutral-600 mb-4">
                  Product description will appear here
                </p>
                <div className="text-xl font-bold text-neutral-800">$0.00</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Product 2
                </h3>
                <p className="text-neutral-600 mb-4">
                  Product description will appear here
                </p>
                <div className="text-xl font-bold text-neutral-800">$0.00</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Product 3
                </h3>
                <p className="text-neutral-600 mb-4">
                  Product description will appear here
                </p>
                <div className="text-xl font-bold text-neutral-800">$0.00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            Browse our complete collection or filter by your preferences above.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-neutral-800 hover:bg-neutral-900 text-white px-8 py-6 text-lg"
              onClick={() => navigate("/shop")}
            >
              View All Products
            </Button>
            <Button
              variant="outline"
              className="border-neutral-800 text-neutral-800 hover:bg-neutral-100 px-8 py-6 text-lg"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedBrand(null);
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
