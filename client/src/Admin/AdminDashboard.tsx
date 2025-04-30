import { useEffect, useState } from 'react';
import axios from 'axios';
import './Css/AdminDashboard.css'; // Import the CSS file

// Define the structure of an order
interface Product {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  shopName: string;
  email: string;
  mobileNo: string;
  address: string;
  received: string;
  products: Product[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]); // State to store all orders
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); // State to store filtered orders
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for the shop name search term
  const [statusFilter, setStatusFilter] = useState<string>(''); // State for the status filter
  const [message, setMessage] = useState<string>(''); // State for success/error messages

  // Fetch all orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('https://rogshop.onrender.com/api/admin/orders'); // Backend endpoint for fetching all orders
        setOrders(response.data);
        setFilteredOrders(response.data); // Initialize filtered orders
      } catch (error) {
        console.error('Error fetching orders:', error);
        setMessage('Error fetching orders');
      }
    };

    fetchOrders();
  }, []);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterOrders(value, statusFilter);
  };

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    filterOrders(searchTerm, value);
  };

  // Filter orders based on shop name and status
  const filterOrders = (shopName: string, status: string) => {
    const filtered = orders.filter((order) => {
      const matchesShopName = order.shopName.toLowerCase().includes(shopName.toLowerCase());
      const matchesStatus = status ? order.received === status : true;
      return matchesShopName && matchesStatus;
    });
    setFilteredOrders(filtered);
  };

  return (
    <div className="container">
      <h2 className="heading">Admin Dashboard - All Orders</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Shop Name"
          value={searchTerm}
          onChange={handleSearch}
          className="searchBar"
        />
        <select value={statusFilter} onChange={handleStatusChange} className="dropdown">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="Complete">Complete</option>
        </select>
      </div>
      {message && <p className="message">{message}</p>}
      {filteredOrders.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th className="th">Order ID</th>
              <th className="th">Shop Name</th>
              <th className="th">Customer Email</th>
              <th className="th">Mobile Number</th>
              <th className="th">Products</th>
              <th className="th">Total Quantity</th>
              <th className="th">Total Price</th>
              <th className="th">Address</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="td">{order._id}</td>
                <td className="td">{order.shopName}</td>
                <td className="td">{order.email}</td>
                <td className="td">{order.mobileNo}</td>
                <td className="td">
                  {order.products.map((product, index) => (
                    <div key={index}>
                      {product.productName} (x{product.quantity})
                    </div>
                  ))}
                </td>
                <td className="td">
                  {order.products.reduce((total, product) => total + product.quantity, 0)}
                </td>
                <td className="td">
                  ${order.products
                    .reduce((total, product) => total + product.price * product.quantity, 0)
                    .toFixed(2)}
                </td>
                <td className="td">{order.address}</td>
                <td className="td">{order.received || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="emptyMessage">No orders found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
