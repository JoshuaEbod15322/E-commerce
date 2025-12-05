// src/lib/orders.js
import { supabase } from "./supabase";

// Get user's orders
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

// Get all orders (admin) - SIMPLIFIED
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Get order by ID
export const getOrder = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(*)
      `
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};
