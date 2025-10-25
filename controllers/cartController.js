// // const { pool } = require('../config/database');

// // const cartController = {
// //   // Get user's cart
// //   async getCart(req, res) {
// //     try {
// //       const result = await pool.query(
// //         `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url, p.emoji_icon, p.in_stock
// //          FROM cart c
// //          JOIN products p ON c.product_id = p.id
// //          WHERE c.user_id = $1
// //          ORDER BY c.created_at DESC`,
// //         [req.user.id]
// //       );
      
// //       res.json(result.rows);
// //     } catch (err) {
// //       console.error('Error fetching cart:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   },

// //   // Add to cart
// //   async addToCart(req, res) {
// //     const { product_id, quantity = 1 } = req.body;
    
// //     try {
// //       const productCheck = await pool.query(
// //         'SELECT in_stock FROM products WHERE id = $1',
// //         [product_id]
// //       );
      
// //       if (productCheck.rows.length === 0) {
// //         return res.status(404).json({ error: 'Product not found' });
// //       }
      
// //       if (!productCheck.rows[0].in_stock) {
// //         return res.status(400).json({ error: 'Product is out of stock' });
// //       }
      
// //       const result = await pool.query(
// //         `INSERT INTO cart (user_id, product_id, quantity)
// //          VALUES ($1, $2, $3)
// //          ON CONFLICT (user_id, product_id)
// //          DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
// //          RETURNING *`,
// //         [req.user.id, product_id, quantity]
// //       );
      
// //       res.json({ message: 'Product added to cart', item: result.rows[0] });
// //     } catch (err) {
// //       console.error('Error adding to cart:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   },

// //   // Update cart item quantity
// //   async updateCartItem(req, res) {
// //     const { product_id } = req.params;
// //     const { quantity } = req.body;
    
// //     if (quantity < 1) {
// //       return res.status(400).json({ error: 'Quantity must be at least 1' });
// //     }
    
// //     try {
// //       const result = await pool.query(
// //         'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
// //         [quantity, req.user.id, product_id]
// //       );
      
// //       if (result.rows.length === 0) {
// //         return res.status(404).json({ error: 'Cart item not found' });
// //       }
      
// //       res.json({ message: 'Cart updated', item: result.rows[0] });
// //     } catch (err) {
// //       console.error('Error updating cart:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   },

// //   // Remove from cart
// //   async removeFromCart(req, res) {
// //     const { product_id } = req.params;
    
// //     try {
// //       const result = await pool.query(
// //         'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
// //         [req.user.id, product_id]
// //       );
      
// //       if (result.rows.length === 0) {
// //         return res.status(404).json({ error: 'Cart item not found' });
// //       }
      
// //       res.json({ message: 'Product removed from cart' });
// //     } catch (err) {
// //       console.error('Error removing from cart:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   },

// //   // Clear cart
// //   async clearCart(req, res) {
// //     try {
// //       await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
      
// //       res.json({ message: 'Cart cleared' });
// //     } catch (err) {
// //       console.error('Error clearing cart:', err);
// //       res.status(500).json({ error: 'Server error' });
// //     }
// //   }
// // };

// // module.exports = cartController;









// const { pool } = require("../config/database")

// const cartController = {
//   // Get user's cart
//   async getCart(req, res) {
//     try {
//       const result = await pool.query(
//         `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url, p.emoji_icon, p.in_stock
//          FROM cart c
//          JOIN products p ON c.product_id = p.id
//          WHERE c.user_id = $1
//          ORDER BY c.created_at DESC`,
//         [req.user.id],
//       )

//       res.json(result.rows)
//     } catch (err) {
//       console.error("Error fetching cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Add to cart
//   async addToCart(req, res) {
//     const { product_id, quantity = 1 } = req.body

//     try {
//       const productCheck = await pool.query("SELECT in_stock FROM products WHERE id = $1", [product_id])

//       if (productCheck.rows.length === 0) {
//         return res.status(404).json({ error: "Product not found" })
//       }

//       if (!productCheck.rows[0].in_stock) {
//         return res.status(400).json({ error: "Product is out of stock" })
//       }

//       const result = await pool.query(
//         `INSERT INTO cart (user_id, product_id, quantity)
//          VALUES ($1, $2, $3)
//          ON CONFLICT (user_id, product_id)
//          DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
//          RETURNING *`,
//         [req.user.id, product_id, quantity],
//       )

//       res.json({ message: "Product added to cart", item: result.rows[0] })
//     } catch (err) {
//       console.error("Error adding to cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Update cart item quantity
//   async updateCartItem(req, res) {
//     const { product_id } = req.params
//     const { quantity } = req.body

//     if (quantity < 1) {
//       return res.status(400).json({ error: "Quantity must be at least 1" })
//     }

//     try {
//       const result = await pool.query(
//         "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
//         [quantity, req.user.id, product_id],
//       )

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: "Cart item not found" })
//       }

//       res.json({ message: "Cart updated", item: result.rows[0] })
//     } catch (err) {
//       console.error("Error updating cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Remove from cart
//   async removeFromCart(req, res) {
//     const { product_id } = req.params

//     try {
//       const result = await pool.query("DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *", [
//         req.user.id,
//         product_id,
//       ])

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: "Cart item not found" })
//       }

//       res.json({ message: "Product removed from cart" })
//     } catch (err) {
//       console.error("Error removing from cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Clear cart
//   async clearCart(req, res) {
//     try {
//       await pool.query("DELETE FROM cart WHERE user_id = $1", [req.user.id])

//       res.json({ message: "Cart cleared" })
//     } catch (err) {
//       console.error("Error clearing cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Admin: Get all carts or specific customer cart
//   async getCustomerCart(req, res) {
//     const { userId } = req.params

//     try {
//       const result = await pool.query(
//         `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url, p.emoji_icon, p.in_stock,
//                 u.name as customer_name, u.email as customer_email
//          FROM cart c
//          JOIN products p ON c.product_id = p.id
//          JOIN users u ON c.user_id = u.id
//          WHERE c.user_id = $1
//          ORDER BY c.created_at DESC`,
//         [userId],
//       )

//       res.json({
//         success: true,
//         cart: result.rows,
//         total_items: result.rows.length,
//       })
//     } catch (err) {
//       console.error("Error fetching customer cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Admin: Get all carts from all customers
//   async getAllCarts(req, res) {
//     try {
//       const result = await pool.query(
//         `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url,
//                 u.name as customer_name, u.email as customer_email
//          FROM cart c
//          JOIN products p ON c.product_id = p.id
//          JOIN users u ON c.user_id = u.id
//          ORDER BY c.created_at DESC`,
//       )

//       res.json({
//         success: true,
//         carts: result.rows,
//         total_items: result.rows.length,
//       })
//     } catch (err) {
//       console.error("Error fetching all carts:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Admin: Delete customer cart item
//   async deleteCustomerCartItem(req, res) {
//     const { userId, productId } = req.params

//     try {
//       const result = await pool.query("DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *", [
//         userId,
//         productId,
//       ])

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: "Cart item not found" })
//       }

//       res.json({
//         success: true,
//         message: "Cart item deleted successfully",
//         deleted_item: result.rows[0],
//       })
//     } catch (err) {
//       console.error("Error deleting customer cart item:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Admin: Clear entire customer cart
//   async clearCustomerCart(req, res) {
//     const { userId } = req.params

//     try {
//       const result = await pool.query("DELETE FROM cart WHERE user_id = $1 RETURNING *", [userId])

//       res.json({
//         success: true,
//         message: "Customer cart cleared successfully",
//         deleted_items: result.rows.length,
//       })
//     } catch (err) {
//       console.error("Error clearing customer cart:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },
// }

// module.exports = cartController


const { pool } = require("../config/database")

const cartController = {
  // Get user's cart
  async getCart(req, res) {
    try {
      const result = await pool.query(
        `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url, p.emoji_icon, p.in_stock
         FROM cart_items c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [req.user.id],
      )

      res.json(result.rows)
    } catch (err) {
      console.error("Error fetching cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Add to cart
  async addToCart(req, res) {
    const { product_id, quantity = 1 } = req.body

    try {
      const productCheck = await pool.query("SELECT in_stock FROM products WHERE id = $1", [product_id])

      if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: "Product not found", message: "المنتج غير موجود" })
      }

      if (!productCheck.rows[0].in_stock) {
        return res.status(400).json({ error: "Product is out of stock", message: "المنتج غير متوفر" })
      }

      const result = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
         RETURNING *`,
        [req.user.id, product_id, quantity],
      )

      res.json({ message: "Product added to cart", message_ar: "تم إضافة المنتج إلى السلة", item: result.rows[0] })
    } catch (err) {
      console.error("Error adding to cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Update cart item quantity
  async updateCartItem(req, res) {
    const { product_id } = req.params
    const { quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1", message: "الكمية يجب أن تكون 1 على الأقل" })
    }

    try {
      const result = await pool.query(
        "UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
        [quantity, req.user.id, product_id],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Cart item not found", message: "عنصر السلة غير موجود" })
      }

      res.json({ message: "Cart updated", message_ar: "تم تحديث السلة", item: result.rows[0] })
    } catch (err) {
      console.error("Error updating cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Remove from cart
  async removeFromCart(req, res) {
    const { product_id } = req.params

    try {
      const result = await pool.query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *", [
        req.user.id,
        product_id,
      ])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Cart item not found", message: "عنصر السلة غير موجود" })
      }

      res.json({ message: "Product removed from cart", message_ar: "تم حذف المنتج من السلة" })
    } catch (err) {
      console.error("Error removing from cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Clear cart
  async clearCart(req, res) {
    try {
      await pool.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id])

      res.json({ message: "Cart cleared", message_ar: "تم تفريغ السلة" })
    } catch (err) {
      console.error("Error clearing cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Admin: Get all carts or specific customer cart
  async getCustomerCart(req, res) {
    const { userId } = req.params

    try {
      const result = await pool.query(
        `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url, p.emoji_icon, p.in_stock,
                u.name as customer_name, u.email as customer_email
         FROM cart_items c
         JOIN products p ON c.product_id = p.id
         JOIN users u ON c.user_id = u.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [userId],
      )

      res.json({
        success: true,
        cart: result.rows,
        total_items: result.rows.length,
      })
    } catch (err) {
      console.error("Error fetching customer cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Admin: Get all carts from all customers
  async getAllCarts(req, res) {
    try {
      const result = await pool.query(
        `SELECT c.*, p.name, p.name_ar, p.brand, p.price, p.image_url,
                u.name as customer_name, u.email as customer_email
         FROM cart_items c
         JOIN products p ON c.product_id = p.id
         JOIN users u ON c.user_id = u.id
         ORDER BY c.created_at DESC`,
      )

      res.json({
        success: true,
        carts: result.rows,
        total_items: result.rows.length,
      })
    } catch (err) {
      console.error("Error fetching all carts:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Admin: Delete customer cart item
  async deleteCustomerCartItem(req, res) {
    const { userId, productId } = req.params

    try {
      const result = await pool.query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *", [
        userId,
        productId,
      ])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Cart item not found", message: "عنصر السلة غير موجود" })
      }

      res.json({
        success: true,
        message: "Cart item deleted successfully",
        message_ar: "تم حذف عنصر السلة بنجاح",
        deleted_item: result.rows[0],
      })
    } catch (err) {
      console.error("Error deleting customer cart item:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },

  // Admin: Clear entire customer cart
  async clearCustomerCart(req, res) {
    const { userId } = req.params

    try {
      const result = await pool.query("DELETE FROM cart_items WHERE user_id = $1 RETURNING *", [userId])

      res.json({
        success: true,
        message: "Customer cart cleared successfully",
        message_ar: "تم تفريغ سلة العميل بنجاح",
        deleted_items: result.rows.length,
      })
    } catch (err) {
      console.error("Error clearing customer cart:", err)
      res.status(500).json({ error: "Server error", message: "حدث خطأ في الخادم" })
    }
  },
}

module.exports = cartController
