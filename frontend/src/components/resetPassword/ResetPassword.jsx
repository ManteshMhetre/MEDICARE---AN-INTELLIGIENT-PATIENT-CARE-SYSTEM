import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import { FaLock } from 'react-icons/fa6';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import httpClient from '../../httpClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const checkPassword = (pass) => {
    return pass.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkPassword(password)) {
      setError('Password should be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await httpClient.post(`/reset_password/${token}`, {
        password: password
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/'); 
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black-1/50">
      <div className="bg-blue-3 text-blue-8 max-w-[450px] w-full p-12 rounded-[3px] max-xs:px-4 max-xs:py-8 mx-4">
        <h2 className="text-white-1 mb-6">Reset Password</h2>
        
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        {success && <Alert severity="success" className="mb-4">{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-[15px] text-white-1" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[15px] cursor-pointer"
            >
              {showPassword ? (
                <IoEyeOffOutline className="text-white-1" size={18} />
              ) : (
                <IoEyeOutline className="text-white-1" size={18} />
              )}
            </span>
          </div>

          <div className="relative mb-6">
            <FaLock className="absolute left-3 top-[15px] text-white-1" size={16} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[15px] cursor-pointer"
            >
              {showConfirmPassword ? (
                <IoEyeOffOutline className="text-white-1" size={18} />
              ) : (
                <IoEyeOutline className="text-white-1" size={18} />
              )}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-7 hover:bg-blue-6 disabled:bg-blue-7 disabled:cursor-not-allowed py-3 px-6 rounded-[3px] transition-colors duration-200 ease-out text-blue-1"
          >
            {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;