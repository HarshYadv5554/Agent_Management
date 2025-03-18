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
import { updateAgent } from '../services/api';

interface EditAgentModalProps {
  open: boolean;
  onClose: () => void;
  onAgentUpdated: () => void;
  agent: {
    _id: string;
    name: string;
    email: string;
    mobileNumber: string;
  };
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, 'Please enter a valid mobile number with country code')
    .required('Mobile number is required'),
});

const EditAgentModal: React.FC<EditAgentModalProps> = ({ open, onClose, onAgentUpdated, agent }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Agent</DialogTitle>
      <Formik
        initialValues={{
          name: agent.name,
          email: agent.email,
          mobileNumber: agent.mobileNumber,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await updateAgent(agent._id, values);
            toast.success('Agent updated successfully');
            onAgentUpdated();
            onClose();
          } catch (error) {
            toast.error('Failed to update agent');
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
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Agent'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditAgentModal; 