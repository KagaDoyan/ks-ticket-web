'use client';
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Chip, Collapse, IconButton, Stack, Button, TextField, Modal, Paper, InputAdornment, MenuItem, Select, SelectChangeEvent, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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

const groupHourlyData = (
    hourlyData: HourlyData[], 
    range: number, 
    startHour?: number, 
    endHour?: number
): HourlyData[] => {
    const groupedData: { [key: string]: HourlyData } = {};

    hourlyData.forEach(entry => {
        // Parse the time 
        const [hours] = entry.time.split(':').map(Number);

        // Apply time range filter if specified
        if (
            (startHour !== undefined && hours < startHour) || 
            (endHour !== undefined && hours > endHour)
        ) {
            return; // Skip this entry
        }

        const groupKey = `${Math.floor(hours / range) * range}:00 - ${Math.floor(hours / range) * range + (range - 1)}:59`;

        if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
                time: groupKey,
                working: 0,
                available: 0,
                ticketDetails: []
            };
        }

        // Aggregate data for the group
        groupedData[groupKey].working += entry.working;
        groupedData[groupKey].available = Math.max(groupedData[groupKey].available, entry.available);
        groupedData[groupKey].ticketDetails.push(...entry.ticketDetails);
    });

    // Convert grouped data to array and sort
    return Object.values(groupedData).sort((a, b) => {
        const [startA] = a.time.split(':').map(Number);
        const [startB] = b.time.split(':').map(Number);
        return startA - startB;
    });
};

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
    const [groupRange, setGroupRange] = useState<number>(3);
    const [isTableExpanded, setIsTableExpanded] = useState(false);
    const [expandedRowIndex, setExpandedRowIndex] = useState<Set<number>>(new Set());
    
    // Custom time range state
    const [useCustomTimeRange, setUseCustomTimeRange] = useState(false);
    const [startHour, setStartHour] = useState<number>(0);
    const [endHour, setEndHour] = useState<number>(23);
    const [isCustomFilterOpen, setIsCustomFilterOpen] = useState(false);

    const handleGroupRangeChange = (event: SelectChangeEvent<number>) => {
        setGroupRange(Number(event.target.value));
    };

    // Toggle entire table expansion
    const handleTableExpandClick = () => {
        setIsTableExpanded(!isTableExpanded);
        // Reset row-specific expansion when toggling entire table
        setExpandedRowIndex(new Set());
    };

    // Toggle individual row expansion
    const handleRowExpandClick = (index: number) => {
        if (expandedRowIndex.has(index)) {
            const newSet = new Set(expandedRowIndex);
            newSet.delete(index);
            setExpandedRowIndex(newSet);
        } else {
            setExpandedRowIndex(new Set([...expandedRowIndex, index]));
        }
        // Ensure table is expanded when a row is expanded
        if (!isTableExpanded) {
            setIsTableExpanded(true);
        }
    };

    // Open custom filter dialog
    const handleOpenCustomFilter = () => {
        setIsCustomFilterOpen(true);
    };

    // Close custom filter dialog
    const handleCloseCustomFilter = () => {
        setIsCustomFilterOpen(false);
    };

    // Apply custom filter
    const handleApplyCustomFilter = () => {
        setUseCustomTimeRange(true);
        handleCloseCustomFilter();
    };

    // Reset custom filter
    const handleResetCustomFilter = () => {
        setUseCustomTimeRange(false);
        setStartHour(0);
        setEndHour(23);
        handleCloseCustomFilter();
    };

    // Prepare hourly data with optional filtering
    const filteredHourlyData = useCustomTimeRange 
        ? groupHourlyData(node.hourlyDistribution, groupRange, startHour, endHour)
        : groupHourlyData(node.hourlyDistribution, groupRange);

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    sx={{ mb: 2 }}
                >
                    <Typography variant="subtitle1">Group Range:</Typography>
                    <Select
                        value={groupRange}
                        onChange={handleGroupRangeChange}
                        size="small"
                        sx={{ minWidth: 100 }}
                    >
                        <MenuItem value={1}>1 Hour</MenuItem>
                        <MenuItem value={2}>2 Hours</MenuItem>
                        <MenuItem value={3}>3 Hours</MenuItem>
                        <MenuItem value={4}>4 Hours</MenuItem>
                        <MenuItem value={6}>6 Hours</MenuItem>
                        <MenuItem value={12}>12 Hours</MenuItem>
                    </Select>

                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleOpenCustomFilter}
                    >
                        Custom Time Filter
                    </Button>

                    {useCustomTimeRange && (
                        <Chip 
                            label={`Time: ${startHour}:00 - ${endHour}:59`} 
                            onDelete={() => setUseCustomTimeRange(false)} 
                            color="primary" 
                            size="small" 
                        />
                    )}

                    <IconButton 
                        onClick={handleTableExpandClick}
                        sx={{ marginLeft: 'auto' }}
                    >
                        <ExpandMoreIcon 
                            sx={{ 
                                transform: isTableExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s'
                            }} 
                        />
                    </IconButton>
                </Stack>

                <Collapse in={isTableExpanded} timeout="auto" unmountOnExit>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Working</TableCell>
                                    <TableCell>Available</TableCell>
                                    <TableCell>Tickets</TableCell>
                                    <TableCell padding="checkbox"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHourlyData.map((hour, index) => (
                                    <React.Fragment key={index}>
                                        <TableRow
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                backgroundColor: hour.working > 0 ? 'rgba(255, 165, 0, 0.1)' : 'inherit',
                                                cursor: hour.working > 0 ? 'pointer' : 'default',
                                            }}
                                            onClick={() => hour.working > 0 && handleRowExpandClick(index)}
                                        >
                                            <TableCell component="th" scope="row">
                                                {hour.time}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={hour.working} 
                                                    color="warning" 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold' }} 
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={hour.available} 
                                                    color="success" 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold' }} 
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {hour.ticketDetails.length}
                                            </TableCell>
                                            <TableCell padding="checkbox">
                                                {hour.working > 0 && (
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            transform: expandedRowIndex.has(index) ? 'rotate(180deg)' : 'none',
                                                            transition: 'transform 0.2s',
                                                        }}
                                                    >
                                                        <ExpandMoreIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {hour.working > 0 && expandedRowIndex.has(index) && (
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                                                    <Collapse in={true} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 1 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                Ticket Details
                                                            </Typography>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Ticket Number</TableCell>
                                                                        <TableCell>Engineer Name</TableCell>
                                                                        <TableCell>Inc Number</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {hour.ticketDetails.map((ticket, ticketIndex) => (
                                                                        <TableRow key={ticketIndex}>
                                                                            <TableCell>{ticket.ticket_number}</TableCell>
                                                                            <TableCell>{ticket.engineer_name}</TableCell>
                                                                            <TableCell>{ticket.inc_number}</TableCell>
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

                {/* Custom Time Range Filter Dialog */}
                <Dialog 
                    open={isCustomFilterOpen} 
                    onClose={handleCloseCustomFilter}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Custom Time Range Filter</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField
                                label="Start Hour"
                                type="number"
                                inputProps={{ min: 0, max: 23 }}
                                value={startHour}
                                onChange={(e) => setStartHour(Number(e.target.value))}
                                fullWidth
                            />
                            <TextField
                                label="End Hour"
                                type="number"
                                inputProps={{ min: 0, max: 23 }}
                                value={endHour}
                                onChange={(e) => setEndHour(Number(e.target.value))}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetCustomFilter} color="secondary">
                            Reset
                        </Button>
                        <Button onClick={handleApplyCustomFilter} color="primary">
                            Apply
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export function NodeDashboardPage(): React.JSX.Element {
    const [nodeData, setNodeData] = useState<NodeSummary[]>([]);
    const [filteredData, setFilteredData] = useState<NodeSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('DD/MM/YYYY'));
    const [searchQuery, setSearchQuery] = useState<string>('');
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

    // if (error) {
    //     return <Typography variant="h6" color="error">Error: {error}</Typography>;
    // }

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
}
