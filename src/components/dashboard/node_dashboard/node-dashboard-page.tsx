'use client';
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Chip, Collapse, IconButton, Stack, Button, TextField, Modal, Paper, InputAdornment } from '@mui/material';
import { authClient } from '@/lib/auth/client';
import { toast } from 'react-toastify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { Refresh, People, Search } from '@mui/icons-material';

// Data Types
interface Engineer {
    id: number;
    name: string;
    status: 'working' | 'available';
    currentTask?: string;
}

interface HourlyData {
    time: string;
    working: number;
    available: number;
    ticketDetails: {
        ticket_number: string;
        engineer_name: string;
        inc_number: string;
    }[];
}

interface NodeSummary {
    date: string;
    nodeId: number;
    nodeName: string;
    totalEngineers: number;
    totalWorking: number;
    totalAvailable: number;
    hourlyDistribution: HourlyData[];
    engineers?: Engineer[];
}

interface ApiResponse {
    data: NodeSummary[];
}

interface DashboardProps {
    nodeData: NodeSummary[];
    onViewEngineers: (node: NodeSummary) => void;
}

interface EngineerListModalProps {
    open: boolean;
    onClose: () => void;
    node: NodeSummary | null;
    selectedDate: string;
}

interface Ticket {
    ticket_status: string;
    ticket_number: string;
    open_date: string;
    time_in: string;
    time_out: string;
}

interface Engineer {
    engineerId: number;
    engineerName: string;
    taskCount: number;
    tickets: Ticket[];
}

interface EngineerResponse {
    status: string;
    data: {
        nodeId: number;
        nodeName: string;
        engineers: Engineer[];
    }
}

interface TaskDetailsModalProps {
    open: boolean;
    onClose: () => void;
    engineer: Engineer | null;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ open, onClose, engineer }) => {
    if (!engineer) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="task-details-modal"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxHeight: '80vh',
                overflowY: 'auto',
                maxWidth: '900px',
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 1,
            }}>
                <Paper sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                Tasks for {engineer.engineerName}
                            </Typography>
                            <IconButton onClick={onClose} size="small">
                                ✕
                            </IconButton>
                        </Stack>

                        {engineer.tickets.length === 0 ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <Typography color="text.secondary">No tasks found</Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Ticket Number</TableCell>
                                            <TableCell align="center">Open Date</TableCell>
                                            <TableCell align="center">Time In</TableCell>
                                            <TableCell align="center">Time Out</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {engineer.tickets.map((ticket, index) => (
                                            <TableRow key={index}>
                                                <TableCell align="center">{ticket.ticket_number}</TableCell>
                                                <TableCell align="center">{ticket.open_date}</TableCell>
                                                <TableCell align="center">{ticket.time_in}</TableCell>
                                                <TableCell align="center">{ticket.time_out}</TableCell>
                                                <TableCell align="center">{ticket.ticket_status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </Modal>
    );
};

const EngineerListModal: React.FC<EngineerListModalProps> = ({ open, onClose, node, selectedDate }) => {
    const [loading, setLoading] = useState(false);
    const [engineers, setEngineers] = useState<Engineer[]>([]);
    const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([]);
    const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEngineers = async () => {
            if (!node) return;
            
            try {
                setLoading(true);
                const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
                const res = await fetch(`${baseUrl}/api/node/engineer-count/${node.nodeId}?date=${dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}`, {
                    headers: {
                        'Authorization': `Bearer ${authClient.getToken()}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch engineers');
                }

                const response: EngineerResponse = await res.json();
                if (response.status === 'success') {
                    setEngineers(response.data.engineers);
                    setFilteredEngineers(response.data.engineers);
                } else {
                    throw new Error('Failed to fetch engineers');
                }
            } catch (error) {
                toast.error('Failed to fetch engineers list');
            } finally {
                setLoading(false);
            }
        };

        if (open && node) {
            fetchEngineers();
        }
    }, [open, node, selectedDate]);

    useEffect(() => {
        const filtered = engineers.filter(engineer =>
            engineer.engineerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEngineers(filtered);
    }, [searchQuery, engineers]);

    if (!node) return null;

    const handleViewTasks = (engineer: Engineer) => {
        setSelectedEngineer(engineer);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setIsTaskModalOpen(false);
        setSelectedEngineer(null);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="engineer-list-modal"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxHeight: '80vh',
                    overflowY: 'scroll',
                    maxWidth: '900px',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 1,
                }}>
                    <Paper sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">
                                    Engineers in {node.nodeName}
                                </Typography>
                                <IconButton onClick={onClose} size="small">
                                    ✕
                                </IconButton>
                            </Stack>

                            <TextField
                                size="small"
                                placeholder="Search engineer name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {loading ? (
                                <Box display="flex" justifyContent="center" p={3}>
                                    <Typography>Loading engineers...</Typography>
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell align="center">Task Count</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredEngineers.map((engineer) => (
                                                <TableRow key={engineer.engineerId}>
                                                    <TableCell>{engineer.engineerName}</TableCell>
                                                    <TableCell align="center">{engineer.taskCount}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={engineer.taskCount > 0 ? 'Working' : 'Available'}
                                                            color={engineer.taskCount > 0 ? 'warning' : 'success'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleViewTasks(engineer)}
                                                            disabled={engineer.taskCount === 0}
                                                        >
                                                            View Tasks
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Stack>
                    </Paper>
                </Box>
            </Modal>

            <TaskDetailsModal
                open={isTaskModalOpen}
                onClose={handleCloseTaskModal}
                engineer={selectedEngineer}
            />
        </>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ nodeData, onViewEngineers }) => {
    return (
        <Grid container spacing={2} direction="row">
            {nodeData.map((node) => (
                <Grid item xs={12} md={12} lg={12} key={node.nodeId}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {node.nodeName}
                                </Typography>
                                <Button
                                    startIcon={<People />}
                                    size="small"
                                    onClick={() => onViewEngineers(node)}
                                >
                                    View Engineers
                                </Button>
                            </Stack>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }} color="primary">
                                Total Engineers: {node.totalEngineers}
                            </Typography>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }} color="info">
                                <a style={{ color: 'orange' }}>Total Working: {node.totalWorking}</a> | <a style={{ color: 'green' }}>Total Available: {node.totalAvailable}</a>
                            </Typography>
                            <CollapseCard node={node} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

const CollapseCard: React.FC<{ node: NodeSummary }> = ({ node }) => {
    const [expanded, setExpanded] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleRowClick = (index: number) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    return (
        <Box mt={2}>
            <Box display="flex" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }} color="textPrimary">
                    Hourly Data
                </Typography>
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                    sx={{ marginLeft: 'auto' }}
                >
                    <ExpandMoreIcon />
                </IconButton>
            </Box>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Working</TableCell>
                                <TableCell>Available</TableCell>
                                <TableCell padding="checkbox"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {node.hourlyDistribution.map((hour, index) => (
                                <React.Fragment key={index}>
                                    <TableRow
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                                            cursor: hour.working > 0 ? 'pointer' : 'default',
                                            '&:hover': hour.working > 0 ? { backgroundColor: '#e0e0e0' } : {},
                                        }}
                                        onClick={() => hour.working > 0 && handleRowClick(index)}
                                    >
                                        <TableCell>{hour.time}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={hour.working}
                                                color={hour.working > 0 ? 'primary' : 'default'}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={hour.available}
                                                color={hour.available > 0 ? 'secondary' : 'default'}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell padding="checkbox">
                                            {hour.working > 0 && (
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        transform: expandedRow === index ? 'rotate(180deg)' : 'none',
                                                        transition: 'transform 0.2s',
                                                    }}
                                                >
                                                    <ExpandMoreIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    {hour.working > 0 && (
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                                <Collapse in={expandedRow === index} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 1 }}>
                                                        <Typography variant="h6" gutterBottom component="div">
                                                            Working Engineers
                                                        </Typography>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Ticket Number</TableCell>
                                                                    <TableCell>INC Number</TableCell>
                                                                    <TableCell>Engineer Name</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {hour.ticketDetails.map((detail, detailIndex) => (
                                                                    <TableRow key={detailIndex}>
                                                                        <TableCell>{detail.ticket_number}</TableCell>
                                                                        <TableCell>{detail.inc_number}</TableCell>
                                                                        <TableCell>{detail.engineer_name}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};

export function NodeDashboardPage(): React.JSX.Element {
    const [nodeData, setNodeData] = useState<NodeSummary[]>([]);
    const [filteredData, setFilteredData] = useState<NodeSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(dayjs(Date.now()).format('DD/MM/YYYY'));
    const [selectedNode, setSelectedNode] = useState<NodeSummary | null>(null);
    const [isEngineerModalOpen, setIsEngineerModalOpen] = useState(false);

    const fetchData = async (selectedDate: string) => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
            const res = await fetch(`${baseUrl}/api/node/with-engineer?date=${dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }

            const data: ApiResponse = await res.json();
            setNodeData(data.data);
            setFilteredData(data.data);
        } catch (error: any) {
            toast.error("Failed to fetch node data");
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter data based on search query
    useEffect(() => {
        const filtered = nodeData.filter(node => 
            node.nodeName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchQuery, nodeData]);

    // Fetch data from API
    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    const handleRefresh = () => {
        fetchData(selectedDate);
    };

    // Calculate summary statistics
    const totalEngineers = filteredData.reduce((sum, node) => sum + node.totalEngineers, 0);
    const totalWorking = filteredData.reduce((sum, node) => sum + node.totalWorking, 0);
    const totalAvailable = filteredData.reduce((sum, node) => sum + node.totalAvailable, 0);

    const handleViewEngineers = (node: NodeSummary) => {
        setSelectedNode(node);
        setIsEngineerModalOpen(true);
    };

    const handleCloseEngineerModal = () => {
        setIsEngineerModalOpen(false);
        setSelectedNode(null);
    };

    if (error) {
        return <Typography variant="h6" color="error">Error: {error}</Typography>;
    }

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item lg={12} md={6} xs={6}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color={'text.secondary'}>
                            Node Dashboard
                        </Typography>
                        <Button
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Grid>
                
                {/* Summary Statistics */}
                <Grid item lg={12} md={12} xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Engineers
                                    </Typography>
                                    <Typography variant="h4">{totalEngineers}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Working
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'orange' }}>
                                        {totalWorking}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Available
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: 'green' }}>
                                        {totalAvailable}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item lg={12} md={12} xs={12}>
                    <Box>
                        <Card sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <DatePicker
                                    label="Select Date"
                                    value={dayjs(selectedDate, "DD/MM/YYYY")}
                                    format="DD/MM/YYYY"
                                    onChange={(newValue) => {
                                        if (newValue) { setSelectedDate(newValue.format('DD/MM/YYYY')) }
                                    }}
                                    slotProps={{ textField: { size: 'small' } }}
                                />
                                <TextField
                                    size="small"
                                    label="Search node name"
                                    autoComplete='off'
                                    variant="outlined"
                                    sx={{ flexGrow: 1 }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Stack>
                        </Card>
                    </Box>
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <Typography>Loading data...</Typography>
                        </Box>
                    ) : (
                        <Dashboard 
                            nodeData={filteredData} 
                            onViewEngineers={handleViewEngineers}
                        />
                    )}
                </Grid>
            </Grid>

            <EngineerListModal
                open={isEngineerModalOpen}
                onClose={handleCloseEngineerModal}
                node={selectedNode}
                selectedDate={selectedDate}
            />
        </div>
    );
};
