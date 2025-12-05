// src/CartPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Shield,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";
import { getCartItems, updateCartQuantity, removeFromCart } from "@/lib/cart";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const shippingFee = 50;

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      console.log("Loading cart data...");

      // Get current user with timeout
      const currentUser = await Promise.race([
        getCurrentUser(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("User load timeout")), 5000)
        ),
      ]);

      if (!currentUser) {
        console.log("No user, redirecting to login");
        navigate("/login");
        return;
      }

      setUser(currentUser);
      console.log("User loaded:", currentUser.email);

      // Load cart items
      const cartData = await getCartItems(currentUser.id);
      setCartItems(cartData || []);
      setSelectedItems(cartData?.map((item) => item.id) || []);

      console.log("Cart data loaded successfully");
    } catch (error) {
      console.error("Error loading cart:", error);
      setLoadError(error.message);

      if (error.message.includes("timeout")) {
        alert("Loading cart took too long. Please try again.");
      } else {
        alert("Failed to load cart items. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );
  const total = subtotal + shippingFee;

  const handleQuantityChange = async (cartItemId, change) => {
    try {
      const cartItem = cartItems.find((item) => item.id === cartItemId);
      if (!cartItem) return;

      const newQuantity = Math.max(1, cartItem.quantity + change);
      await updateCartQuantity(cartItemId, newQuantity);

      setCartItems((items) =>
        items.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      setCartItems((items) => items.filter((item) => item.id !== cartItemId));
      setSelectedItems((selected) =>
        selected.filter((id) => id !== cartItemId)
      );
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (cartItemId) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select items to checkout");
      return;
    }

    // This will be replaced with Stripe integration
    console.log("Proceeding to checkout with:", selectedCartItems);
    alert("Proceeding to checkout...");
    // In real implementation: navigate to Stripe checkout
  };

  const handleBackToShop = () => {
    navigate("/dashboard");
  };

  const handleRetryLoad = () => {
    setLoadError(null);
    loadCartData();
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Failed to Load Cart
          </h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryLoad}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <ShoppingBag className="absolute inset-0 m-auto h-10 w-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Your Cart
          </h2>
          <p className="mt-2 text-gray-500">
            Getting your shopping items ready...
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-gray-600 mt-2">
                Review your items and proceed to checkout
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToShop}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Cart Items</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedItems.length === cartItems.length &&
                        cartItems.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label
                      htmlFor="select-all"
                      className="text-sm cursor-pointer"
                    >
                      Select all ({selectedItems.length} items)
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Add some items to get started
                    </p>
                    <Button onClick={handleBackToShop}>Browse Products</Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-4">
                          <div className="flex items-start space-x-4">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleSelectItem(item.id)}
                              className="mt-2"
                            />
                            {item.products?.images?.[0] ? (
                              <img
                                src={item.products.images[0]}
                                alt={item.products.name}
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg border flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {item.products?.name || "Unknown Product"}
                                </h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {item.products?.brands?.name ||
                                      "Unknown Brand"}
                                  </span>
                                  {item.selected_size && (
                                    <span>Size: {item.selected_size}</span>
                                  )}
                                  <span>
                                    Category:{" "}
                                    {item.products?.categories?.name ||
                                      "Unknown"}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(item.id, -1)
                                  }
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(item.id, 1)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  P
                                  {(
                                    (item.products?.price || 0) * item.quantity
                                  ).toFixed(2)}
                                </div>
                                {item.quantity > 1 && (
                                  <div className="text-sm text-gray-500">
                                    P{(item.products?.price || 0).toFixed(2)}{" "}
                                    each
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">P{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      P{shippingFee.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>P{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security & Payment Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure SSL encrypted payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>We accept Visa, Mastercard, PayPal</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  {selectedItems.length === 0
                    ? "Select items to checkout"
                    : `Proceed to Checkout (P${total.toFixed(2)})`}
                </Button>

                {selectedItems.length > 0 && (
                  <p className="text-sm text-center text-gray-600">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Cart Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {cartItems.length}
            </div>
            <div className="text-sm text-gray-600">Items in Cart</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {selectedItems.length}
            </div>
            <div className="text-sm text-gray-600">Selected Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-gray-900">
              P{total.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
