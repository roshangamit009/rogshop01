import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopView = () => {
  const { shopId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const shopName = location.state?.shopName || 'Shop';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: string]: number }>({});
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [viewOrders, setViewOrders] = useState(false);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products?shopkeeperId=${shopId}&shopName=${shopName}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [shopId, shopName]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products-categories?shopkeeperId=${shopId}&shopName=${shopName}`
        );
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [shopId, shopName]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders', {
          params: { email: userEmail },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, [userEmail]);

  const incrementQuantity = (productId: string, maxQuantity: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 1) + 1, maxQuantity),
    }));
  };

  const decrementQuantity = (productId: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) - 1, 1),
    }));
  };

  const addToCart = async (product: any) => {
    const quantity = selectedQuantities[product._id] || 1;
    const cartItem = {
      userEmail,
      shopId,
      shopName,
      product: product.productName,
      quantity,
      totalBill: product.price * quantity,
    };

    try {
      await axios.post('http://localhost:5000/api/cart', cartItem);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleDropdownOption = (option: string) => {
    setDropdownVisible(false);
    if (option === 'myOrders') {
      setViewOrders(true);
    } else if (option === 'cart') {
      navigate('/cart');
    } else if (option === 'myProfile') {
      navigate('/profile');
    } else if (option === 'logout') {
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.shopName}>{shopName}</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBar}
        />
        <div style={styles.userEmailContainer}>
          <span style={styles.userEmail} onClick={() => setDropdownVisible((prev) => !prev)}>
            {userEmail}
          </span>
          {dropdownVisible && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownItem} onClick={() => handleDropdownOption('myOrders')}>
                🧾 My Orders
              </div>
              <div style={styles.dropdownItem} onClick={() => handleDropdownOption('cart')}>
                🛒 Cart
              </div>
              <div style={styles.dropdownItem} onClick={() => handleDropdownOption('myProfile')}>
                👤 My Profile
              </div>
              <div style={styles.dropdownItem} onClick={() => handleDropdownOption('logout')}>
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </header>

      <div style={styles.main}>
        {viewOrders ? (
          <div style={styles.ordersContainer}>
            <h2 style={styles.heading}>My Orders</h2>
            {orders.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Shop Name</th>
                    <th style={styles.th}>Products</th>
                    <th style={styles.th}>Total Quantity</th>
                    <th style={styles.th}>Total Price</th>
                    <th style={styles.th}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={styles.td}>{order._id}</td>
                      <td style={styles.td}>{order.shopName}</td>
                      <td style={styles.td}>
                        {order.products.map((product: any, index: number) => (
                          <div key={index}>
                            {product.productName} (x{product.quantity})
                          </div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {order.products.reduce(
                          (total: number, product: any) => total + product.quantity,
                          0
                        )}
                      </td>
                      <td style={styles.td}>
                        ₹
                        {order.products
                          .reduce(
                            (total: number, product: any) =>
                              total + product.price * product.quantity,
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td style={styles.td}>{order.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.emptyMessage}>You have no orders yet.</p>
            )}
          </div>
        ) : (
          <>
            <aside style={styles.sidebar}>
              <h3 style={styles.sidebarHeading}>Categories</h3>
              <ul style={styles.categoryList}>
                <li
                  style={{
                    ...styles.categoryItem,
                    backgroundColor: selectedCategory === '' ? '#007bff' : '#f8f9fa',
                    color: selectedCategory === '' ? '#fff' : '#000',
                  }}
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </li>
                {categories.map((category, index) => (
                  <li
                    key={index}
                    style={{
                      ...styles.categoryItem,
                      backgroundColor: selectedCategory === category ? '#007bff' : '#f8f9fa',
                      color: selectedCategory === category ? '#fff' : '#000',
                    }}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </aside>
            <main style={styles.content}>
              <div style={styles.productList}>
                {filteredProducts.map((product) => (
                  <div key={product._id} style={styles.productCard}>
                    <div style={styles.imageContainer}>
                      <img
                        src={`data:image/jpeg;base64,${product.productImage}`}
                        alt={product.productName}
                        style={styles.productImage}
                      />
                    </div>
                    <div style={styles.productDetails}>
                      <h3 style={styles.productName}>{product.productName}</h3>
                      <p style={styles.productDetail}>
                        <strong>Price:</strong> ₹{product.price}
                      </p>
                      <p style={styles.productDetail}>
                        <strong>Stock:</strong> {product.quantity}
                      </p>
                      <div style={styles.quantityContainer}>
                        <button
                          style={styles.quantityButton}
                          onClick={() => decrementQuantity(product._id)}
                        >
                          -
                        </button>
                        <span style={styles.quantityText}>
                          {selectedQuantities[product._id] || 1}
                        </span>
                        <button
                          style={styles.quantityButton}
                          onClick={() => incrementQuantity(product._id, product.quantity)}
                        >
                          +
                        </button>
                      </div>
                      <button style={styles.addToCartButton} onClick={() => addToCart(product)}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  searchBar: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '50%',
  },
  userEmailContainer: {
    position: 'relative',
  },
  userEmail: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    width: '200px',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
    textAlign: 'left',
    fontSize: '1rem',
    color: '#333',
  },
  main: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRight: '1px solid #ddd',
  },
  sidebarHeading: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
  },
  categoryList: {
    listStyle: 'none',
    padding: 0,
  },
  categoryItem: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#fff',
  },
  productList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  productCard: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '150px',
    overflow: 'hidden',
    borderRadius: '10px',
    marginBottom: '1rem',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productDetails: {
    textAlign: 'left',
  },
  productName: {
    fontSize: '1.2rem',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  productDetail: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '0.5rem',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  quantityButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  quantityText: {
    margin: '0 0.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  addToCartButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  ordersContainer: {
    padding: '2rem',
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ddd',
    padding: '0.5rem',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
  },
  td: {
    border: '1px solid #ddd',
    padding: '0.5rem',
    textAlign: 'left',
  },
  emptyMessage: {
    fontSize: '1rem',
    color: '#555',
  },
};

export default ShopView;
