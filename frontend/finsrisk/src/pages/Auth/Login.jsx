import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  FileText,
  ArrowRight,
  HandCoins
} from "lucide-react"
import { API_PATHS } from "../../utils/apiPaths"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import axiosInstance from "../../utils/axiosInstance"
import { validatedEmail, validatedPassword } from "../../utils/helper"

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (touched[name]) {
      const newFieldErrors = { ...fieldErrors };
      if (name === "email") {
        newFieldErrors.email = validatedEmail(value);
      } else if (name === "password") {
        newFieldErrors.password = validatedPassword(value);
      }
      setFieldErrors(newFieldErrors);
    }
    if (error) setError("");
  }
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const newFieldErrors = { ...fieldErrors };
    if (name === "email") {
      newFieldErrors.email = validatedEmail(formData.email);
    } else if (name === "password") {
      newFieldErrors.password = validatedPassword(formData.password);
    }
    setFieldErrors(newFieldErrors);

  }

  const isFormValid = () => {
    const emailError = validatedEmail(formData.email);
    const passwordError = validatedPassword(formData.password);
    return !emailError && !passwordError && formData.email && formData.password;
  };


  const handleSubmit = async (e) => {
    const emailError = validatedEmail(formData.email);
    const passwordError = validatedPassword(formData.password);
    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError
      });
      setTouched({
        email: true,
        password: true
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);
      if (response.status === 200) {
        const { token } = response.data;

        if (token) {
          setSuccess("Login successful");
          login(response.data, token);

          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      } else {
        setError(response.data.message || "Invalid Credentials. Please try again.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
        console.log(err.response?.data, err.response?.status, err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-white px-4'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <div className='w-12 h-12 bg-gradient-to-r from-green-950 to-green-900 rounded-xl mx-auto flex items-center justify-center'>
            <HandCoins className='w-6 h-6 text-white' />
          </div>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>Login to your account</h1>
          <p className='text-gray-600 text-sm'>Welcome Back</p>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email
            </label>
            <div className='relative'>
              <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-200 ${fieldErrors.email && touched.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-black"
                  }`}
              />
            </div>
            {fieldErrors.email && touched.email && (
              <p className='mt-1 text-sm text-red-600'>{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Password
            </label>
            <div className='relative'>
              <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all  ${fieldErrors.password && touched.password
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-black"
                  }`}
              />
              <button
                type="button"
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>
            {fieldErrors.password && touched.password && (
              <p className='mt-1 text-sm text-red-600'>{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}
          {success && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-sm text-green-600'>{success}</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isloading || !isFormValid()}
            className='w-full bg-gradient-to-r from-green-950 to-green-900 rounded-lg py-3 px-4 font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center group text-white '
          >
            {isloading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Signing in....
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </button>

          <div className='mt-6 pt-4 border-t border-gray-200 text-center'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{" "}
              <button
                className='text-black font-medium hover:underline'
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login