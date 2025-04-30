import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  email: string;
  mobileNo: string;
  address: string;
  products: Product[];
  createdAt: string;
  received: string;
}

const ShopkeeperOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const shopName = localStorage.getItem('shopkeeperName') || '';
  const email = localStorage.getItem('shopkeeperEmail') || '';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders', {
          params: { shopName, email },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setMessage('Error fetching orders');
      }
    };

    fetchOrders();
  }, [shopName, email]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleStatusChange = async (orderId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        received: 'Complete',
      });
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, received: 'Complete' } : order
        )
      );
      setMessage('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage('Error updating order status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
        setOrders(prev => prev.filter(order => order._id !== orderId));
        setMessage('Order deleted successfully');
      } catch (error) {
        console.error('Error deleting order:', error);
        setMessage('Error deleting order');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{shopName || email} - Shop Orders</h2>
      {message && <p style={styles.message}>{message}</p>}

      {orders.length > 0 ? (
        orders.map(order => {
          const totalAmount = order.products.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          ).toFixed(2);
          const isExpanded = expandedOrderId === order._id;

          const orderCardStyle = {
            ...styles.orderCard,
            backgroundColor: order.received === 'Complete' ? '#d4edda' : '#f8d7da',
            borderColor: order.received === 'Complete' ? '#c3e6cb' : '#f5c6cb',
          };

          return (
            <div key={order._id} style={orderCardStyle}>
              <div style={styles.summary} onClick={() => toggleExpand(order._id)}>
                <span><strong>Email:</strong> {order.email}</span>
                <span><strong>Total:</strong> ₹{totalAmount}</span>
              </div>

              {isExpanded && (
                <div style={styles.details}>
                  <p><strong>Mobile:</strong> {order.mobileNo}</p>
                  <p><strong>Address:</strong> {order.address}</p>
                  <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Received:</strong> {order.received}</p>
                  <div>
                    <strong>Products:</strong>
                    <ul>
                      {order.products.map((product, index) => (
                        <li key={index}>
                          {product.productName} (x{product.quantity}) - ₹{product.price * product.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p><strong>Total Quantity:</strong> {order.products.reduce((sum, p) => sum + p.quantity, 0)}</p>
                  <p><strong>Total Amount:</strong> ₹{totalAmount}</p>

                  {order.received !== 'Complete' && (
                    <button style={styles.button} onClick={() => handleStatusChange(order._id)}>
                      Mark as Complete
                    </button>
                  )}
                  <button style={{ ...styles.button, backgroundColor: '#dc3545' }} onClick={() => handleDelete(order._id)}>
                    Delete Order
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p style={styles.emptyMessage}>No orders found for your shop.</p>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem',
  },
  heading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#007bff',
  },
  message: {
    color: 'green',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  orderCard: {
    border: '1px solid',
    borderRadius: '8px',
    marginBottom: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontSize: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #eee',
  },
  details: {
    marginTop: '0.75rem',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '1rem',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#555',
  },
};

export default ShopkeeperOrder;
