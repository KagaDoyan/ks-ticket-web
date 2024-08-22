import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CraeteKoonServiceForm from './pdf/koonservice';

const MenuButton = ({ data }: { data: any }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleCreatePDF = (service_name: string) => {
    const html = CraeteKoonServiceForm(service_name, data);
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow?.document.write(html);
    printWindow?.document.close(); // Ensure the content is fully loaded
    printWindow?.focus();
  }

  return (
    <div>
      <Button variant="contained" onClick={handleClick}>
        PDF
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleCreatePDF('koon')}>Koon service</MenuItem>
        <MenuItem onClick={() => handleCreatePDF('advice')}>Advice service</MenuItem>
        <MenuItem onClick={() => handleCreatePDF('tcc')}>TCC service</MenuItem>
      </Menu>
    </div>
  );
};

export default MenuButton;
