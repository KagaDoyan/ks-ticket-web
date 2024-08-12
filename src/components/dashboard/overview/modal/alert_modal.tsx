import { Box, Modal, Typography } from "@mui/material";

export default function AlertModal({
  modal_open,
  handleModalClose,
}: {
  modal_open: boolean;
  handleModalClose: () => void;
}): React.JSX.Element {
  return (
    <Modal
      open={modal_open}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
          Alert!
        </Typography>
        <Box>
          <Typography variant="h5" color="error" sx={{ textAlign: 'center' }}>
            You have open tickets, check it out!
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}
