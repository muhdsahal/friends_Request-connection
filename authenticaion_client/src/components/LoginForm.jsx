// src/LoginForm.js

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {Card,CardBody,Input,Button,Typography,Alert,} from '@material-tailwind/react';
import { BASE_URL } from '../constants/constants';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().required('email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post(`${BASE_URL}auth/token/`, values);
      login(response.data);
      localStorage.setItem('token',response.data.access)
      console.log(response.data.access,'llllllllllllllllllllll');
      navigate('/home');
    } catch (error) {
      setErrors({ submit: 'Invalid email or password' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardBody>
          <Typography variant="h4" color="blue-gray">
            Login
          </Typography>
          <Formik
            initialValues={{ email: '', password1: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors }) => (
              <Form className="mt-8">
                <div className="mb-4">
                  <Field name="email" as={Input} label="email" type="text" variant="outlined" fullWidth />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="mb-4">
                  <Field name="password" as={Input} label="Password" type="password" variant="outlined" fullWidth />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                {errors.submit && (
                  <Alert color="red" className="mb-4">
                    {errors.submit}
                  </Alert>
                )}
                <Button type="submit" color="blue" fullWidth disabled={isSubmitting}>
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginForm;
