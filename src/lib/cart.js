// src/lib/cart.js
import { supabase } from "./supabase";

// Get user's cart items
export const getCartItems = async (userId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      products(*)
    `
    )
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

// Add item to cart
export const addToCart = async (
  userId,
  productId,
  quantity = 1,
  selectedSize = null
) => {
  const { data, error } = await supabase
    .from("cart_items")
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        quantity,
        selected_size: selectedSize,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,product_id,selected_size",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update cart item quantity
export const updateCartQuantity = async (cartItemId, quantity) => {
  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) throw error;
  return data;
};

// Clear cart for user
export const clearCart = async (userId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};
