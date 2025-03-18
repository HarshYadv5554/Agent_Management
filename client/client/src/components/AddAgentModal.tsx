import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { createAgent } from '../services/api';

interface AddAgentModalProps {
  open: boolean;
  onClose: () => void;
  onAgentAdded: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, 'Please enter a valid mobile number with country code')
    .required('Mobile number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const AddAgentModal: React.FC<AddAgentModalProps> = ({ open, onClose, onAgentAdded }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Agent</DialogTitle>
      <Formik
        initialValues={{
          name: '',
          email: '',
          mobileNumber: '',
          password: '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            await createAgent(values);
            toast.success('Agent added successfully');
            resetForm();
            onAgentAdded();
            onClose();
          } catch (error) {
            toast.error('Failed to add agent');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <TextField
                fullWidth
                margin="normal"
                name="mobileNumber"
                label="Mobile Number"
                placeholder="+1234567890"
                value={values.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.mobileNumber && Boolean(errors.mobileNumber)}
                helperText={touched.mobileNumber && errors.mobileNumber}
              />
              <TextField
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Agent'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddAgentModal; 