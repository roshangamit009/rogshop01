import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ShopkeeperLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/shopkeeper-login', formData);

      if (response.data.success) {
        localStorage.setItem('shopkeeperId', response.data.shopkeeperId);
        localStorage.setItem('shopkeeperName', response.data.shopName);
        localStorage.setItem('shopkeeperEmail', formData.email);
        navigate('/shopkeeperhome');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="container">
      <style>{`
        .container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .heading {
          text-align: center;
          margin-bottom: 1rem;
        }
        .input {
          width: 100%;
          padding: 0.6rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .button {
          width: 100%;
          padding: 0.75rem;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .message {
          text-align: center;
          margin-top: 1rem;
          color: red;
        }
        .linkText {
          text-align: center;
          margin-top: 1rem;
        }
        .link {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }
      `}</style>

      <h2 className="heading">Shopkeeper Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="input"
        />
        <button type="submit" className="button">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="linkText">
        Are you a user?{' '}
        <Link to="/login" className="link">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default ShopkeeperLogin;
