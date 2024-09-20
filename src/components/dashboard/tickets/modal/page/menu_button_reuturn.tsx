import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { PictureAsPdfOutlined } from '@mui/icons-material';
import CraeteKoonServiceReturnForm from './pdf/koonservice_return';

const MenuReturnButton = ({ data }: { data: any }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleCreatePDF = (service_name: string) => {
    const html = CraeteKoonServiceReturnForm(service_name, data);
    const printWindow = window.open('', '_blank', 'height=600,width=800');

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close(); // Ensure the content is fully loaded

      printWindow.onload = () => {
        printWindow.focus(); // Focus the window only after it is fully loaded
      };

      // Set up an event listener to prevent blanking out the page on interaction
      printWindow.addEventListener('beforeunload', (event) => {
        event.preventDefault();
        printWindow.document.write(html);
        printWindow.document.close();
      });
    }
  };

  return (
    <div>
      <Button startIcon={<PictureAsPdfOutlined />} variant="contained" onClick={handleClick}>
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

export default MenuReturnButton;
