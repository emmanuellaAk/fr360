import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  FileText,
  ArrowRight,
  User,
  HandCoins
} from "lucide-react"
import { API_PATHS } from "../../utils/apiPaths"
import { useNavigate } from "react-router-dom"
import { useAuth } from '../../context/AuthContext'
import { validatedEmail, validatedPassword } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'

const SignUp = () => {

  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const validateName = (name) => {
    if (!name) return "Name is required.";
    if (name.length < 2) return "Name must be at least 2 characters long.";
    if (name.length > 50) return "Name must be less than 50 characters.";
    return "";
  };
  const validateConfirmPassword = (confirmPassword, password) => {
    if (confirmPassword !== password) return "Please confirm your password correctly.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (touched[name]) {
      const newFieldErrors = { ...fieldErrors };
      if (name === "name") {
        newFieldErrors.name = validateName(value);
      } else if (name === "email") {
        newFieldErrors.email = validatedEmail(value);
      } else if (name === "password") {
        newFieldErrors.password = validatedPassword(value);

        if (touched.confirmPassword) {
          newFieldErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, value);
        }
      } else if (name === "confirmPassword") {
        newFieldErrors.confirmPassword = validateConfirmPassword(value, formData.password);
      }
      setFieldErrors(newFieldErrors);
    }
    if (error) setError("");
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const newFieldErrors = { ...fieldErrors };
    if (name === "name") {
      newFieldErrors.name = validateName(formData.name);
    } else if (name === "email") {
      newFieldErrors.email = validatedEmail(formData.email);
    } else if (name === "password") {
      newFieldErrors.password = validatedPassword(formData.password);
    } else if (name === "confirmPassword") {
      newFieldErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);
    }
    setFieldErrors(newFieldErrors);
  };
  const isFormValid = () => {
    const nameError = validateName(formData.name);
    const emailError = validatedEmail(formData.email);
    const passwordError = validatedPassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    return (!nameError && !emailError && !passwordError && !confirmPasswordError && formData.name && formData.email && formData.password && formData.confirmPassword);
  };
  const handleSubmit = async (e) => {
    const nameError = validateName(formData.name);
    const emailError = validatedEmail(formData.email);
    const passwordError = validatedPassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (nameError || emailError || passwordError || confirmPasswordError) {
      setFieldErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError
      });
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true
      });
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        username: formData.name,
        email: formData.email,
        password: formData.password
      });

      const data = response.data;
      const { token } = data;
      if (response.status === 201) {
        setSuccess("Registration successful");
      }


      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      setTouched({
        name: false,
        email: false,
        password: false,
        confirmPassword: false
      });

      login(data, token);
      navigate("/");

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("API error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-white px-4 py-8'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <div className='w-12 h-12 bg-gradient-to-r from-green-950 to-green-900 rounded-xl mx-auto flex items-center justify-center'>
            <HandCoins className='w-6 h-6 text-white' />
          </div>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>Create Account</h1>
          <p className='text-gray-600 text-sm'>Sign Up Call To Action</p>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
            <div className='relative'>
              <User className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${touched.name && fieldErrors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-black'
                  }`}
              />
            </div>
            {touched.name && fieldErrors.name && (
              <p className='mt-1 text-sm text-red-600'>{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
            <div className='relative'>
              <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your email address"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${touched.email && fieldErrors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-black'
                  }`}
              />
            </div>
            {touched.email && fieldErrors.email && (
              <p className='mt-1 text-sm text-red-600'>{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
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
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${touched.password && fieldErrors.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-black'
                  }`}
              />
              <button
                type='button'
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
            {touched.password && fieldErrors.password && (
              <p className='mt-1 text-sm text-red-600'>{fieldErrors.password}</p>
            )}
          </div>

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password</label>
            <div className='relative'>
              <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Re-enter your password"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${touched.confirmPassword && fieldErrors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-black'
                  }`}
              />
              <button
                type='button'
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>
            {touched.confirmPassword && fieldErrors.confirmPassword && (
              <p className='mt-1 text-sm text-red-600'>{fieldErrors.confirmPassword}</p>
            )}
          </div>


          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='mt-1 text-sm text-red-600'>{error}</p>
            </div>
          )}
          {success && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
              <p className='mt-1 text-sm text-green-600'>{success}</p>
            </div>
          )}
        </div>

        <div className='flex items-start pt-2 mb-6'>
          <input
            type="checkbox"
            id="terms"
            className='w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-1'
            required
          />
          <label htmlFor="terms" className='ml-2 text-sm text-gray-600'>
            I agree to the {" "}
            <button className='text-black hover:underline'>
              Terms of Service
            </button> and {" "}
            <button className='text-black hover:underline'>
              Privacy Policy
            </button>
          </label>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-green-950 to-green-900 rounded-lg py-3 px-4 font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center group text-white "
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-w animate-spin mr-2' size={16} />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' size={16} />
              </>
            )}
          </button>
        </div>
        <div className='mt-6 pt-4 border-t border-gray-200 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{" "}
            <button
              className='text-black font-medium hover:underline'
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>


  )
}

export default SignUp;