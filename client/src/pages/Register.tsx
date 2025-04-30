import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred');
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

      <h2 className="heading">Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
          required
          className="input"
        />
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
        <button type="submit" className="button">Register</button>
      </form>
      {message && (
        <p className="message" style={{ color: message.toLowerCase().includes('success') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      <p className="linkText">
        Already have an account?{' '}
        <Link to="/login" className="link">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
