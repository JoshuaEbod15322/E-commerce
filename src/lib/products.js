// src/lib/products.js
import { supabase } from "./supabase";

// Get all products
export const getProducts = async (filters = {}) => {
  try {
    console.log("Getting products with filters:", filters);

    let query = supabase.from("products").select(`
        *,
        brands(name),
        categories(name)
      `);

    // Apply filters
    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }
    if (filters.brand_id) {
      query = query.eq("brand_id", filters.brand_id);
    }
    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters.featured) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    console.log(`Found ${data?.length || 0} products`);
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getProducts:", error);
    return [];
  }
};

// Get single product
export const getProduct = async (id) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        brands(*),
        categories(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Create product
export const createProduct = async (productData) => {
  try {
    console.log("Creating product with data:", productData);

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          description: productData.description || "",
          price: productData.price,
          brand_id: productData.brand_id,
          category_id: productData.category_id,
          stock: productData.stock || 0,
          sizes: productData.sizes || [],
          images: productData.images || [],
          featured: productData.featured || false,
        },
      ])
      .select(
        `
        *,
        brands(name),
        categories(name)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating product:", error);
      throw error;
    }

    console.log("Product created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    console.log("Updating product with data:", productData);

    const { data, error } = await supabase
      .from("products")
      .update({
        name: productData.name,
        description: productData.description || "",
        price: productData.price,
        brand_id: productData.brand_id,
        category_id: productData.category_id,
        stock: productData.stock || 0,
        sizes: productData.sizes || [],
        images: productData.images || [],
        featured: productData.featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        brands(name),
        categories(name)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error updating product:", error);
      throw error;
    }

    console.log("Product updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Get all brands
export const getBrands = async () => {
  try {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching brands:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching brands:", error);
    return [];
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching categories:", error);
    return [];
  }
};
