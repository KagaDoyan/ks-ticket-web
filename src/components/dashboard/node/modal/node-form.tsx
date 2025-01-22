import { Box, Modal, Button, TextField, Typography, Stack, Autocomplete, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import useOnMount from "@mui/utils/useOnMount";
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';

const modalStyle = {
  position: 'absolute' as 'absolute',
  padding: 10,
  borderRadius: 3,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

interface Province {
  id: number;
  name: string;
  code: string;
}

export default function NodeModalForm({ open, handleClose, nodeID, fetchnodeData }: { open: boolean, handleClose: () => void, nodeID: number, fetchnodeData: () => void }): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    provinceData: [] as { province_id: number; node_time: number }[]
  });

  const [provinces, setProvinces] = useState<Province[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleProvinceChange = (index: number, field: 'province_id' | 'node_time', value: number) => {
    const updatedProvinceData = [...formData.provinceData];
    updatedProvinceData[index] = {
      ...updatedProvinceData[index],
      [field]: value
    };
    setFormData(prevState => ({
      ...prevState,
      provinceData: updatedProvinceData
    }));
  };

  const addProvinceRow = () => {
    setFormData(prevState => ({
      ...prevState,
      provinceData: [...prevState.provinceData, { province_id: 0, node_time: 0 }]
    }));
  };

  const removeProvinceRow = (index: number) => {
    const updatedProvinceData = formData.provinceData.filter((_, i) => i !== index);
    setFormData(prevState => ({
      ...prevState,
      provinceData: updatedProvinceData
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      provinceData: formData.provinceData.map(pd => ({
        province_id: pd.province_id,
        node_time: pd.node_time
      }))
    };

    const url = nodeID 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/node/${nodeID}` 
      : `${process.env.NEXT_PUBLIC_API_URL}/api/node`;
    const method = nodeID ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authClient.getToken()}`
      },
      body: JSON.stringify(payload)
    }).then((res) => {
      if (res.ok) {
        fetchnodeData();
        handleClose();
        toast.success(`Node ${nodeID ? 'updated' : 'created'} successfully`);
      } else {
        throw new Error(`Failed to ${nodeID ? 'update' : 'create'} node`);
      }
    }).catch((err) => {
      toast.error(`Failed to ${nodeID ? 'update' : 'create'} node`);
    });
  };

  const getNodeData = () => {
    if (nodeID) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node/${nodeID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authClient.getToken()}`
        }
      }).then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            const nodeData = data.data;
            setFormData({
              name: nodeData.name,
              provinceData: nodeData.node_on_province.map((np: any) => ({
                province_id: np.province_id,
                node_time: np.node_time
              }))
            });
          })
        }
      }).catch((err) => {
        toast.error("Failed to fetch node data");
      });
    }
  };

  const getProvinces = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/province`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setProvinces(data);
          })
        } else {
          throw new Error("Failed to fetch province data");
        }
      }).catch((err) => {
        toast.error("Failed to fetch province data");
      });
  };

  useEffect(() => {
    if (open) {
      getProvinces();
      if (nodeID) {
        getNodeData();
      } else {
        setFormData({
          name: '',
          provinceData: []
        });
      }
    }
  }, [open, nodeID]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {nodeID ? 'Edit Node' : 'Add Node'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Node Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Provinces</Typography>
          {formData.provinceData.map((provinceData, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Province</InputLabel>
                <Select
                  value={provinceData.province_id}
                  label="Province"
                  onChange={(e) => handleProvinceChange(index, 'province_id', Number(e.target.value))}
                  required
                >
                  {provinces.map((province) => (
                    <MenuItem key={province.id} value={province.id}>
                      {province.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Node Time (minutes)"
                type="number"
                value={provinceData.node_time}
                onChange={(e) => handleProvinceChange(index, 'node_time', Number(e.target.value))}
                required
                sx={{ width: '200px' }}
              />
              <IconButton color="error" onClick={() => removeProvinceRow(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={addProvinceRow}
            sx={{ mb: 2 }}
          >
            Add Province
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {nodeID ? 'Update' : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}