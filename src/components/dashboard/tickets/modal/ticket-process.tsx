import { Box, Modal, Typography, Tabs, Tab } from "@mui/material";
import TicketPage from "./page/ticket_page";
import { useState } from "react";
import EngineerPage from "./page/engineer_page";
import { maxHeight } from "@mui/system";

const style = {
    position: 'absolute' as 'absolute',
    padding: 10,
    borderRadius: 3,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight: '90%',
    overflow: "scroll",
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};




export default function TicketProcessModalForm({ open, handleClose, ticketID, fetchticketData }: { open: boolean, handleClose: () => void, ticketID: number, fetchticketData: () => void }): React.JSX.Element {
    const [active_tab, SetActiveTab] = useState('one');
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        SetActiveTab(newValue);
    };

    const handleModalClose = () => {
        handleClose();
        SetActiveTab('one');
    };

    return (
        <Modal
            BackdropProps={{
                onClick: (event) => event.stopPropagation(), // Disable backdrop click
            }}
            disableEscapeKeyDown
            open={open}
            onClose={handleModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    ticket Form
                </Typography>
                <Tabs
                    value={active_tab}
                    onChange={handleTabChange}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                    centered
                >
                    <Tab value="one" label="Ticket Page" />
                    <Tab value="two" label="Engineer Page" />
                    <Tab value="three" label="Return Page" />
                </Tabs>
                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                        margin: "auto",
                        mt: 2
                    }}
                >

                    {active_tab === "one" && (
                        <>
                            <TicketPage open={open} handleClose={handleModalClose} ticketID={ticketID} fetchticketData={fetchticketData} />
                        </>
                    )}
                    {active_tab === "two" && (
                        <>
                            <EngineerPage open={open} handleClose={handleModalClose} ticketID={ticketID} fetchticketData={fetchticketData} />
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    )
}