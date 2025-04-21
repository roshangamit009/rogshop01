import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  shopName: string;
  products: Product[];
  address: string;
}

const MyOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]); // State to store user orders
  const userEmail = localStorage.getItem('userEmail'); // Get the logged-in user's email

  // Fetch orders for the logged-in user
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('http://localhost:5000/api/orders', {
          params: { email: userEmail }, // Pass userEmail as a query parameter
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [userEmail]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Orders</h2>
      {orders.length > 0 ? (
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Order ID</th>
              <th>Shop Name</th>
              <th>Products</th>
              <th>Total Quantity</th>
              <th>Total Price</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.shopName}</td>
                <td>
                  {order.products.map((product, index) => (
                    <div key={index}>
                      {product.productName} (x{product.quantity})
                    </div>
                  ))}
                </td>
                <td>
                  {order.products.reduce((total, product) => total + product.quantity, 0)}
                </td>
                <td>
                  $
                  {order.products
                    .reduce((total, product) => total + product.price * product.quantity, 0)
                    .toFixed(2)}
                </td>
                <td>{order.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-muted">You have no orders yet.</p>
      )}
    </div>
  );
};

export default MyOrder;