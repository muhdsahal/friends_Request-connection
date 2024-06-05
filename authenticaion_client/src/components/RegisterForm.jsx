// src/RegisterForm.js

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Navigate, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Card,
  CardBody,
  Input,
  Button,
  Typography,
  Alert,
} from '@material-tailwind/react';
import { BASE_URL } from '../constants/constants';

const RegisterForm = () => {

  const navigate = useNavigate()
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters'),
    email : Yup.string()
      .email("Invalid Email Address")
      .required("Email Is Requiered"),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    password2: Yup.string()
      .required('Confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    profile_photo: Yup.mixed().notRequired()
  });
  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('username',values.username)
      formData.append('email',values.email)
      formData.append('password',values.password)
      formData.append('password2',values.password2)
      if(values.profile_photo){
        formData.append('profile_photo',values.profile_photo)
      }
      console.log(formData,'kkkkkkkkkkkkkk');
      const response = await axios.post(`${BASE_URL}auth/user_register/`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log(response.data,'datataaaaaaaaaaaaa');
      alert('Registration successful!');
      navigate('/home')
      resetForm();
    } catch (error) {
      setErrors({ submit: 'An error occurred during registration' });
      
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardBody>
          <Typography variant="h4" color="blue-gray">
            Register
          </Typography>
          <Formik
            initialValues={{ username: '', email: '', password: '', password2: '', profile_photo: null }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, setFieldValue }) => (
              <Form className="mt-8" encType="multipart/form-data">
                <div className="mb-4">
                  <Field name="username" as={Input} label="Username" type="text" variant="outlined" fullWidth />
                  <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="mb-4">
                  <Field name="email" as={Input} label="Email" type="email" variant="outlined" fullWidth />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="mb-4">
                  <Field name="password" as={Input} label="Password" type="password" variant="outlined" fullWidth />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="mb-4">
                  <Field name="password2" as={Input} label="Confirm Password" type="password" variant="outlined" fullWidth />
                  <ErrorMessage name="password2" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    onChange={(event) => {
                      setFieldValue("profile_photo", event.currentTarget.files[0]);
                    }}
                  />
                </div>
                {errors.submit && (
                  <Alert color="red" className="mb-4">
                    {errors.submit}
                  </Alert>
                )}
                <Button type="submit" color="blue" fullwidth disabled={isSubmitting}>
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </div>
  );
};

export default RegisterForm;
