import { authClient } from "@/lib/auth/client";
import { Autocomplete, Box, Button, Checkbox, FormControl, FormControlLabel, FormLabel, Grid, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material";
import useOnMount from "@mui/utils/useOnMount";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ImageUpload, { ExtendedFile } from './ImageUpload';
import dayjs from "dayjs";
import { date } from "zod";
import formatDate from "@/lib/dateformat";
import CraeteKoonServiceForm from "./pdf/koonservice";
import Swal from "sweetalert2";

interface brand {
    id: number
    name: string
}

interface category {
    id: number
    name: string
}

interface model {
    id: number
    name: string
    brand_id: number
}

interface spare_status {
    name: string
}

interface FormData {
    solution: string;
    investigation: string;
    close_description: string;
    item_brand: string;
    item_category: string;
    item_model: string;
    item_sn: string;
    warranty_exp: string;
    ticket_status: string;
    resolve_status: boolean;
    resolve_remark: string;
    action: string;
    time_in: string;
    time_out: string;
    uploadedFiles?: File[];
    ticket_image?: image_url[];
    delete_images?: string[];
}

interface image_url {
    name: string
    path: string
}

const spare_status: spare_status[] = [
    { name: 'spare' },
    { name: 'replace' },
]

export default function ReturnPage({ open, handleClose, ticketID, fetchticketData }: { open: boolean, handleClose: () => void, ticketID: number, fetchticketData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState<FormData>({
        solution: '',
        investigation: '',
        close_description: '',
        item_brand: '',
        item_category: '',
        item_model: '',
        item_sn: '',
        warranty_exp: '',
        resolve_status: false,
        resolve_remark: '',
        ticket_status: '',
        action: '',
        time_in: '',
        time_out: '',
        uploadedFiles: [],
        ticket_image: [],
        delete_images: [],
    });

    const [ticketData, setTicketData] = useState<any>()
    const [BrandOption, setBrandOption] = useState<brand[]>([])
    const [ModelOption, setModelOption] = useState<model[]>([])
    const [CategoryOption, setCategoryOption] = useState<category[]>([])
    const [shopitems, setShopItem] = useState<{ id?: number, serial_number: string, category: string, category_id?: number, brand: string, brand_id?: number, model_id?: number, model: string, warranty_expire_date: string, status: string }[]>([]);
    const [spareitems, setSpareItem] = useState<{ id?: number, serial_number: string, category: string, category_id?: number, brand: string, brand_id?: number, model_id: number, model: string, warranty_expire_date: string, status: string }[]>([]);

    const addShopItem = () => {
        if (shopitems.length < 4) {
            setShopItem([...shopitems, { serial_number: '', category: '', brand: '', model: '', warranty_expire_date: '', status: 'repair' }]);
        } else {
            toast.error("You can only add up to 5 items.");
        }
    };

    const handleShopItemChange = (index: number, field: string, value: string) => {
        const updatedItems = [...shopitems];
        if (field === 'serial_number') {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            setShopItem(updatedItems);

            getitembyserial(value).then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        if (data.data) {
                            setShopItem((prevItems) => {
                                const newItems = [...prevItems];
                                newItems[index] = {
                                    ...newItems[index],
                                    serial_number: value,
                                    category: data.data.category.name,
                                    brand: data.data.brand.name,
                                    model: data.data.model.name,
                                    warranty_expire_date: formatDate(data.data.warranty_expiry_date)
                                };
                                return newItems;
                            });
                        }
                    });
                }
            });
        } else {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            setShopItem(updatedItems);
        }
    };

    const handleShopModelChange = (index: number, model: model) => {
        const updatedItems = [...shopitems];
        updatedItems[index] = { ...updatedItems[index], model_id: model.id, model: model.name };
        setShopItem(updatedItems);
    }

    const handleShopCategoryChange = (index: number, category: category) => {
        const updatedItems = [...shopitems];
        updatedItems[index] = { ...updatedItems[index], category_id: category.id, category: category.name };
        setShopItem(updatedItems);
    }

    const handleShopBrandChange = (index: number, brand: brand) => {
        const updatedItems = [...shopitems];
        updatedItems[index] = { ...updatedItems[index], brand_id: brand.id, brand: brand.name };
        setShopItem(updatedItems);
    }

    const removeShopItem = (index: number) => {
        const updatedItems = shopitems.filter((_, i) => i !== index);
        const removeItem = shopitems.filter((_, i) => i == index)[0];
        if (removeItem.id) {
            Swal.fire({
                title: 'Are you sure?',
                text: "this item had been recorded are you sure you want to delete it?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/store/${removeItem.id}`, {
                        method: 'DELETE',
                        headers: {
                            'authorization': `Bearer ${authClient.getToken()}`
                        }
                    }).then((res) => {
                        if (res.ok) {
                            setShopItem(updatedItems);
                            toast.success('Item deleted');
                        }
                    })
                }
            })
        } else {
            setShopItem(updatedItems);
        }
    };

    const addSpareItem = () => {
        if (spareitems.length < 4) {
            setSpareItem([...spareitems, { serial_number: '', category: '', brand: '', model: '', warranty_expire_date: '', status: 'spare', model_id: 0 }]);
        } else {
            toast.error("You can only add up to 4 items.");
        }
    };

    const handleSpareItemChange = async (index: number, field: string, value: string) => {
        if (field === 'category_id' || field === 'brand_id' || field === 'model_id') {
            const Intvalue = parseInt(value)
            alert(Intvalue)
            const updatedItems = [...spareitems];
            updatedItems[index] = { ...updatedItems[index], [field]: Intvalue };
            setSpareItem(updatedItems);
            console.log(spareitems);
        } else {
            const updatedItems = [...spareitems];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            await setSpareItem(updatedItems);
        }
    };

    const handleSpareModelChange = async (index: number, model: model) => {
        const updatedItems = [...spareitems];
        updatedItems[index] = { ...updatedItems[index], model_id: model.id, model: model.name };
        await setSpareItem(updatedItems);
    }

    const handleSpareCategoryChange = async (index: number, category: category) => {
        const updatedItems = [...spareitems];
        updatedItems[index] = { ...updatedItems[index], category_id: category.id, category: category.name };
        await setSpareItem(updatedItems);
    }

    const handleSpareBrandChange = async (index: number, brand: brand) => {
        const updatedItems = [...spareitems];
        updatedItems[index] = { ...updatedItems[index], brand_id: brand.id, brand: brand.name };
        await setSpareItem(updatedItems);
    }

    const getBrandOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setBrandOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch brand option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch brand option");
            });
    }

    const getCategoryOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setCategoryOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch category option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch category option");
            });
    }

    const getModelOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setModelOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch model option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch model option");
            });
    }

    const fetchticketDatails = () => {
        if (ticketID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/${ticketID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setTicketData(data.data);
                            setFormData({
                                solution: data.data.solution,
                                investigation: data.data.investigation,
                                close_description: data.data.close_description,
                                item_brand: data.data.item_brand,
                                item_category: data.data.item_category,
                                item_model: data.data.item_model,
                                item_sn: data.data.item_sn,
                                ticket_status: data.data.ticket_status,
                                warranty_exp: dayjs(data.data.warranty_exp).format('YYYY-MM-DD'),
                                resolve_status: data.data.resolve_status ? true : false,
                                resolve_remark: data.data.resolve_remark,
                                action: data.data.action, // assuming action_status is an array of strings
                                time_in: dayjs(data.data.time_in).format('YYYY-MM-DD HH:mm'),
                                time_out: dayjs(data.data.time_out).format('YYYY-MM-DD HH:mm'),
                                ticket_image: [...data.data.ticket_image],
                            });

                            if (data.data.spare_item?.length > 0) {
                                setSpareItem([...data.data.spare_item]);
                            }
                            if (data.data.store_item?.length > 0) {
                                setShopItem([...data.data.store_item]);
                            }
                        })
                    } else {
                        throw new Error("Failed to fetch ticket details");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch ticket details");
                });
        }
    }

    const getitembyserial = (serial: string) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/serial/${serial}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
    }

    useOnMount(() => {
        fetchticketDatails();
        getBrandOption()
        getCategoryOption()
        getModelOption()
    })

    useEffect(() => {

    }, [shopitems, spareitems])

    const handleSubmit = () => {
        toast.success("Ticket updated successfully");
    }

    const handleCreatePDF = () => {
        console.log(ticketData);

        const html = CraeteKoonServiceForm('koon', ticketData);
        const printWindow = window.open('', '', 'height=600,width=800');

        printWindow?.document.write(html);
        printWindow?.document.close(); // Ensure the content is fully loaded
        printWindow?.focus();
    }
    return (
        <>
            <Stack justifyContent={"flex-start"} direction="row" spacing={2}>
                <Typography sx={{ fontSize: 17, color: 'grey', paddingBottom: 1, paddingTop: 1 }}>
                    Shop Item
                </Typography>
            </Stack>
            <Grid container spacing={2}>
                {shopitems.length == 0 ? (
                    <Grid item xs={12} sm={6}>
                        <Button onClick={addShopItem} variant="contained" color="primary">
                            Add item
                        </Button>
                    </Grid>
                ) : shopitems.map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Stack spacing={2} sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Item {index + 1}
                            </Typography>
                            <TextField
                                label="Id"
                                value={item.id}
                                sx={{ display: 'none' }}
                            />
                            <TextField
                                disabled
                                label="Serial Number"
                                value={item.serial_number}
                                onChange={(e) => handleShopItemChange(index, 'serial_number', e.target.value)}
                                fullWidth
                                size="small"
                                sx={{ '& .MuiInputBase-input': { padding: '8px' }, border: '1px solid #ddd', borderRadius: 1 }}
                            />
                            <Autocomplete
                                disabled
                                size="small"
                                options={CategoryOption}
                                getOptionLabel={(option) => option.name}
                                value={CategoryOption.find((category) => category.name === item.category) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleShopItemChange(index, 'category_id', "0")
                                        handleShopItemChange(index, 'category', "")
                                    }
                                    const selectedOption = newValue ? newValue : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    handleShopCategoryChange(index, selectedOption);
                                }}
                                renderInput={(params) => <TextField required {...params} label="Category" />}
                            />
                            <Autocomplete
                                disabled
                                size="small"
                                options={BrandOption}
                                getOptionLabel={(option) => option.name}
                                value={BrandOption.find((brand) => brand.name === item.brand) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleShopItemChange(index, 'brand_id', "0")
                                        handleShopItemChange(index, 'brand', "")
                                    }
                                    const selectedOption = newValue ? newValue : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    handleShopBrandChange(index, selectedOption);
                                }}
                                renderInput={(params) => <TextField required {...params} label="Brand" />}
                            />
                            <Autocomplete
                                disabled
                                size="small"
                                options={ModelOption}
                                getOptionLabel={(option) => option.name}
                                value={ModelOption.find((model) => model.name === item.model) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleShopItemChange(index, 'model_id', "0")
                                        handleShopItemChange(index, 'model', "")
                                    }
                                    const selectedOption = newValue ? newValue : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    handleShopModelChange(index, selectedOption);
                                }}
                                renderInput={(params) => <TextField required {...params} label="Model" />}
                            />
                            <TextField
                                disabled
                                label="Warranty Expiry Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={item.warranty_expire_date}
                                onChange={(e) => handleShopItemChange(index, 'warranty_expire_date', e.target.value)}
                                fullWidth
                                size="small"
                                sx={{ '& .MuiInputBase-input': { padding: '8px' }, border: '1px solid #ddd', borderRadius: 1 }}
                            />
                            <Autocomplete
                                size="small"
                                options={[{ name: "return" }, { name: "repair" }]}
                                getOptionLabel={(option) => option.name}
                                value={
                                    item.status
                                        ? [{ name: "return" }, { name: "repair" }].find((status) => status.name === item.status)
                                        : [{ name: "return" }, { name: "repair" }][1] || null
                                }
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleSpareItemChange(index, 'status', "repair")
                                    }
                                    const selectedOption = newValue ? newValue.name : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    handleShopItemChange(index, 'status', selectedOption);
                                }}
                                renderInput={(params) => <TextField required {...params} label="Status" />}
                            />
                            <Button
                                onClick={() => removeShopItem(index)}
                                variant="outlined"
                                color="error"
                                size="small"
                            >
                                Remove
                            </Button>
                            {index === shopitems.length - 1 && shopitems.length < 4 && (
                                <Button onClick={addShopItem} variant="contained" color="primary">
                                    Add More
                                </Button>
                            )}
                        </Stack>
                    </Grid>
                ))}
            </Grid>
            <Stack justifyContent={"flex-start"} direction="row" spacing={2}>
                <Typography sx={{ fontSize: 17, color: 'grey', paddingBottom: 1, paddingTop: 1 }}>
                    Spare Item
                </Typography>
            </Stack>
            <Grid container spacing={2}>
                {spareitems.length == 0 ? (
                    <Grid item xs={12} sm={6}>
                        <Button onClick={addSpareItem} variant="contained" color="primary">
                            Add item
                        </Button>
                    </Grid>
                ) : spareitems.map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Stack spacing={2} sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Item {index + 1}
                            </Typography>
                            <TextField
                                label="Id"
                                value={item.id}
                                sx={{ display: 'none' }}
                            />
                            <TextField
                                disabled
                                label="Serial Number"
                                value={item.serial_number}
                                onChange={(e) => handleSpareItemChange(index, 'serial_number', e.target.value)}
                                fullWidth
                                size="small"
                                sx={{ '& .MuiInputBase-input': { padding: '8px' }, border: '1px solid #ddd', borderRadius: 1 }}
                            />
                            <Autocomplete
                                disabled
                                size="small"
                                options={CategoryOption}
                                getOptionLabel={(option) => option.name}
                                value={CategoryOption.find((category) => category.name === item.category) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleSpareItemChange(index, 'category_id', "0")
                                        handleSpareItemChange(index, 'category', "")
                                    }
                                    const selectedOption = newValue ? newValue : null;
                                    if (!selectedOption) {
                                        return;
                                    } else {
                                        handleSpareCategoryChange(index, selectedOption);
                                    }
                                }}
                                renderInput={(params) => <TextField required {...params} label="Category" />}
                            />
                            <Autocomplete
                                disabled
                                size="small"
                                options={BrandOption}
                                getOptionLabel={(option) => option.name}
                                value={BrandOption.find((brand) => brand.name === item.brand) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleSpareItemChange(index, 'brand_id', "0")
                                        handleSpareItemChange(index, 'brand', "")
                                    }
                                    const selectedOption = newValue ? newValue : null;
                                    // const selectOptionID = newValue ? newValue.id : 0;
                                    if (!selectedOption) {
                                        return;
                                    } else {
                                        handleSpareBrandChange(index, selectedOption);
                                    }
                                }}
                                renderInput={(params) => <TextField required {...params} label="Brand" />}
                            />
                            <Autocomplete
                                disabled
                                size="small"
                                options={ModelOption}
                                getOptionLabel={(option) => option.name}
                                value={ModelOption.find((model) => model.name === item.model) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleSpareItemChange(index, 'model_id', "0")
                                        handleSpareItemChange(index, 'model', "")
                                        return
                                    }
                                    const selectedOption = newValue ? newValue : null;
                                    if (!selectedOption) {
                                        return;
                                    } else {
                                        handleSpareModelChange(index, selectedOption);
                                    }

                                }}
                                renderInput={(params) => <TextField required {...params} label="Model" />}
                            />
                            <TextField
                                label="Warranty Expiry Date"
                                type="date"
                                disabled
                                InputLabelProps={{ shrink: true }}
                                value={item.warranty_expire_date}
                                onChange={(e) => handleSpareItemChange(index, 'warranty_expire_date', e.target.value)}
                                fullWidth
                                size="small"
                                sx={{ '& .MuiInputBase-input': { padding: '8px' }, border: '1px solid #ddd', borderRadius: 1 }}
                            />
                            <Autocomplete
                                size="small"
                                options={spare_status}
                                getOptionLabel={(option) => option.name}
                                value={
                                    item.status
                                        ? spare_status.find((status) => status.name === item.status)
                                        : spare_status[0] || null
                                }
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        handleSpareItemChange(index, 'status', "spare")
                                    }
                                    const selectedOption = newValue ? newValue.name : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    handleSpareItemChange(index, 'status', selectedOption);
                                }}
                                renderInput={(params) => <TextField required {...params} label="Status" />}
                            />
                        </Stack>
                    </Grid>
                ))}
            </Grid>
            <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                <Button onClick={handleClose} variant="contained" color="warning">
                    Close
                </Button>
                <Button onClick={handleCreatePDF} variant="contained" color="warning">
                    PDF
                </Button>
                <Button variant="contained" color="success" onClick={handleSubmit}>
                    Update
                </Button>
            </Stack>
        </>
    )
}