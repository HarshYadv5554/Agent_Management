import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getAgents, deleteAgent, uploadCSV } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddAgentModal from './AddAgentModal';
import EditAgentModal from './EditAgentModal';
import '../styles/global.css';
import '../styles/Dashboard.css';

interface Agent {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  assignedTasks: Array<{
    firstName: string;
    phone: string;
    notes: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgentTasks, setSelectedAgentTasks] = useState<Agent | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      toast.error('Failed to fetch agents');
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAgent) return;

    try {
      await deleteAgent(selectedAgent._id);
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      toast.error('Failed to delete agent');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAgent(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error('Please upload a CSV, XLSX, or XLS file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadCSV(file);
      toast.success('CSV uploaded and tasks distributed successfully');
      fetchAgents();
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      toast.error('Failed to upload CSV file');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewTasks = (agent: Agent) => {
    setSelectedAgentTasks(agent);
    setIsTasksModalOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Agents</Typography>
              <Box>
                <input
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="csv-upload">
                  <Button variant="contained" component="span" sx={{ mr: 2 }}>
                    Upload CSV
                  </Button>
                </label>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Agent
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Mobile Number</TableCell>
                    <TableCell>Assigned Tasks</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.mobileNumber}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewTasks(agent)}
                        >
                          View Tasks ({agent.assignedTasks.length})
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditClick(agent)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(agent)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <AddAgentModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAgentAdded={fetchAgents}
      />

      {selectedAgent && (
        <EditAgentModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAgent(null);
          }}
          onAgentUpdated={fetchAgents}
          agent={selectedAgent}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedAgent?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tasks for {selectedAgentTasks?.name}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedAgentTasks?.assignedTasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.firstName}</TableCell>
                    <TableCell>{task.phone}</TableCell>
                    <TableCell>{task.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTasksModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 