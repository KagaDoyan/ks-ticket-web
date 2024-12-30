import { authClient } from "@/lib/auth/client";
import { Autocomplete, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Menu, Stack, TextField, Typography } from "@mui/material";
import useOnMount from "@mui/utils/useOnMount";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import formatDate from "@/lib/dateformat";
import CraeteKoonServiceForm from "./pdf/koonservice";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import MenuReturnButton from "./menu_button_reuturn";
import React from "react";
import { EmailOutlined } from "@mui/icons-material";
import ImageUpload, { ExtendedFile } from "./ImageUpload";
import { set } from "nprogress";
import ReturnEmailPreviewPage from "./email_preview_reutrn_page";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";

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

interface store_status {
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
    close_date: string;
    close_time: string;
    engineer_id: number;
}

interface image_url {
    name: string
    path: string
}

interface engineer {
    id: number
    name: string,
    lastname: string,
    distance: number,
    open_ticket: number
}

const spare_status: spare_status[] = [
    { name: 'spare' },
    { name: 'return' },
    { name: 'replace' },
]

const store_status: store_status[] = [
    { name: 'repair' },
    { name: 'return' },
    { name: 'replace' },
]

export default function ReturnPage({ open, handleClose, ticketID, fetchticketData }: { open: boolean, handleClose: () => void, ticketID: number, fetchticketData: () => void }): React.JSX.Element {
    let [formData, setFormData] = useState<FormData>({
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
        close_date: '',
        close_time: '',
        engineer_id: 0
    });

    const [incident_number, setIncidentNumber] = useState<string>('');

    const [ticketData, setTicketData] = useState<any>()
    const [BrandOption, setBrandOption] = useState<brand[]>([])
    const [enginnerOption, setEngineerOption] = useState<engineer[]>([]);
    const [ModelOption, setModelOption] = useState<model[]>([])
    const [CategoryOption, setCategoryOption] = useState<category[]>([])
    const [shopitems, setShopItem] = useState<{ id?: number, serial_number: string, category: string, category_id?: number, brand: string, brand_id?: number, model_id?: number, model: string, warranty_expire_date: string, status: string, type: string }[]>([]);
    const [spareitems, setSpareItem] = useState<{ id?: number, serial_number: string, category: string, category_id?: number, brand: string, brand_id?: number, model_id: number, model: string, warranty_expire_date: string, status: string, type: string }[]>([]);
    const [returnitems, setReturnItem] = useState<{ id?: number, serial_number: string, category: string, category_id?: number, brand: string, brand_id?: number, model_id: number, model: string, warranty_expire_date: string, status: string, type: string, item_type?: string }[]>([]);

    const [openEmailPreview, setOpenEmailPreview] = useState(false);

    const handleEmailPreviewClose = () => {
        setOpenEmailPreview(false);
    }

    const handleEmailPreviewOpen = () => {
        setOpenEmailPreview(true);
    }
    const addShopItem = () => {
        if (shopitems.length < 4) {
            setShopItem([...shopitems, { serial_number: '', category: '', brand: '', model: '', warranty_expire_date: '', status: 'return', id: 0, type: '' }]);
        } else {
            toast.error("You can only add up to 5 items.");
        }
    };

    const handleImageUpload = (files: ExtendedFile[]) => {
        setFormData({
            ...formData,
            uploadedFiles: files
        });
    };

    const handleRemoveSpareItem = (removeItem: any) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/returnItem/${removeItem.id}`, {
                    method: 'DELETE',
                    headers: {
                        'authorization': `Bearer ${authClient.getToken()}`
                    }
                }).then((res) => {
                    if (res.ok) {
                        toast.success('return item deleted');
                        fetchticketDatails();
                    }
                })
            }
        })
    }

    const fetchEngineer = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/enigeer/${ticketData?.shop_id ? ticketData?.shop_id : 0}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setEngineerOption(data.data);
                    })
                } else {
                    setEngineerOption([]);
                    throw new Error("Failed to fetch engineer options");
                }
            }).catch((err) => {
                setEngineerOption([]);
            });
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = event.target;
        if (name === 'item_sn') {
            getitembyserial(value).then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setFormData({
                            ...formData,
                            item_sn: value,
                            item_brand: data.data.brand.name,
                            item_category: data.data.category.name,
                            item_model: data.data.model.name,
                            warranty_exp: dayjs(data.data.warranty_exp).format('YYYY-MM-DD')

                        })
                    })
                }
            })
        }
        setFormData({
            ...formData,
            [name]: name === 'resolve_status' ? checked : value
        });
    };

    const handleActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        const actionsArray = formData.action ? formData.action.split(',') : [];

        if (checked) {
            // Add the action if it is checked
            actionsArray.push(name);
        } else {
            // Remove the action if it is unchecked
            const index = actionsArray.indexOf(name);
            if (index > -1) {
                actionsArray.splice(index, 1);
            }
        }

        // Update the action string
        setFormData({ ...formData, action: actionsArray.join(',') });
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
                                    category_id: data.data.category.id,
                                    brand: data.data.brand.name,
                                    brand_id: data.data.brand.id,
                                    model: data.data.model.name,
                                    model_id: data.data.model.id,
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
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/returnItem/${removeItem.id}`, {
                        method: 'DELETE',
                        headers: {
                            'authorization': `Bearer ${authClient.getToken()}`
                        }
                    }).then((res) => {
                        if (res.ok) {
                            setShopItem(updatedItems);
                            toast.success('return item deleted');
                            fetchticketDatails();
                        }
                    })
                }
            })
        } else {
            setShopItem(updatedItems);
        }
    };

    const handleSpareItemChange = async (index: number, field: string, value: string) => {
        if (field === 'category_id' || field === 'brand_id' || field === 'model_id') {
            const Intvalue = parseInt(value)
            alert(Intvalue)
            const updatedItems = [...spareitems];
            updatedItems[index] = { ...updatedItems[index], [field]: Intvalue };
            setSpareItem(updatedItems);
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
                                ...formData,
                                solution: data.data.return_ticket?.solution,
                                investigation: data.data.return_ticket?.investigation,
                                item_brand: data.data.return_ticket?.item_brand,
                                item_category: data.data.return_ticket?.item_category,
                                item_model: data.data.return_ticket?.item_model,
                                item_sn: data.data.return_ticket?.item_sn,
                                resolve_status: data.data.return_ticket?.resolve_status ? true : false,
                                resolve_remark: data.data.return_ticket?.resolve_remark,
                                action: data.data.return_ticket?.action, // assuming action_status is an array of strings
                                time_in: dayjs(data.data.return_ticket?.time_in).format('YYYY-MM-DD HH:mm'),
                                time_out: dayjs(data.data.return_ticket?.time_out).format('YYYY-MM-DD HH:mm'),
                                close_date: data.data.close_date ? dayjs(data.data.close_date).format('YYYY-MM-DD') : '',
                                close_time: data.data.close_time ? data.data.close_time : '',
                                warranty_exp: data.data.return_ticket?.warranty_exp ? dayjs(data.data.return_ticket?.warranty_exp).format('YYYY-MM-DD') : '',
                                ticket_image: [...data.data.return_ticket_images],
                                uploadedFiles: [],
                                delete_images: [],
                                engineer_id: data.data.return_ticket?.engineer_id ? data.data.return_ticket?.engineer_id : data.data.engineer_id,
                            });
                            setIncidentNumber(data.data.inc_number)
                            if (data.data.spare_item?.length > 0) {
                                setSpareItem([...data.data.spare_item]);
                            }
                            if (data.data.store_item?.length > 0) {
                                setShopItem([...data.data.store_item]);
                            }
                            if (data.data.return_item?.length > 0) {
                                setReturnItem([...data.data.return_item]);
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
        fetchEngineer()
    }, [ticketData?.shop_id])

    const handleSubmit = () => {
        if (!formData.resolve_status && (formData.resolve_remark == "" || !formData.resolve_remark)) {
            toast.error("Please enter resolve remark");
            return;
        }
        // Show loading toast
        const toastId = toast.loading("Submitting...", { autoClose: false });
        if (!formData.close_date || !formData.close_time) {
            toast.update(toastId, {
                render: "Please select close date and time",
                type: "error",
                isLoading: false,
                autoClose: 2000  // Auto close after 3 seconds
            });
            return;
        }
        if (!formData.resolve_status && !formData.resolve_remark) {
            toast.update(toastId, {
                render: "Please enter resolve remark",
                type: "error",
                isLoading: false,
                autoClose: 2000  // Auto close after 3 seconds
            })
            return;
        }
        const shopItemsWithType = shopitems.map(item => ({
            ...item,
            ticket_type: 'store',
            type: 'outside'
        }));

        const spareItemsWithType = spareitems.map(item => ({
            ...item,
            ticket_type: 'spare',
            type: 'inside'
        }));


        // Combine the two arrays
        const returnItem = [...shopItemsWithType, ...spareItemsWithType];
        const formattedItems = returnItem.map(item => ({
            id: item.id,
            serial_number: item.serial_number,
            category_id: item.category_id,
            brand_id: item.brand_id,
            model_id: item.model_id,
            warranty_expiry_date: new Date(item.warranty_expire_date),
            inc_number: incident_number,
            status: item.status,
            type: item.type,
            ticket_type: item.ticket_type
        }));

        const payload = new FormData();
        payload.append('solution', formData.solution);
        payload.append('investigation', formData.investigation);
        payload.append('close_description', formData.close_description);
        payload.append('item_brand', formData.item_brand);
        payload.append('item_category', formData.item_category);
        payload.append('item_model', formData.item_model);
        payload.append('item_sn', formData.item_sn);
        payload.append('warranty_exp', formData.warranty_exp);
        payload.append('ticket_status', formData.ticket_status);
        payload.append('resolve_status', formData.resolve_status ? 'true' : 'false');
        payload.append('resolve_remark', formData.resolve_remark);
        payload.append('action', formData.action);
        payload.append('time_in', formData.time_in);
        payload.append('time_out', formData.time_out);
        payload.append('engineer_id', formData.engineer_id.toString());
        if (formData.close_date) {
            payload.append('close_date', formData.close_date);
        }
        if (formData.close_time) {
            payload.append('close_time', formData.close_time);
        }

        // Append uploaded files if present
        if (formData.uploadedFiles) {
            for (const file of formData.uploadedFiles) {
                payload.append('images', file);
            }
        }

        // Append images to delete if present
        if (formData.delete_images) {
            for (const image of formData.delete_images) {
                payload.append('delete_images', image);
            }
        }

        // Serialize and append store and spare items
        payload.append('items', JSON.stringify(formattedItems));
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/update/returnItem/${ticketID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            },
            body: payload
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        fetchticketData()
                        fetchticketDatails()
                        toast.update(toastId, {
                            render: data.data.message,
                            type: "success",
                            autoClose: 2000,  // Auto close after 3 seconds
                            isLoading: false
                        });
                    })
                } else {
                    toast.update(toastId, {
                        render: "Failed to create ticket",
                        type: "error",
                        autoClose: 2000,  // Auto close after 3 seconds
                        isLoading: false
                    })
                }
            }).catch((err) => {
                toast.update(toastId, {
                    render: "Failed to create ticket",
                    type: "error",
                    autoClose: 2000,  // Auto close after 3 seconds
                    isLoading: false
                })
            });

    }

    const isItemSaved = (id: number) => {
        return returnitems.some((returnItem) => returnItem.id === id);
    };

    const isItemInShopOrSpare = (serial_number: string) => {
        return (
            shopitems.some((item) => item.serial_number === serial_number) ||
            spareitems.some((item) => item.serial_number === serial_number)
        );
    };

    // Filter returnitems to get unmatched items
    const unmatchedReturnItems = returnitems.filter(
        (returnItem) => !isItemInShopOrSpare(returnItem.serial_number)
    );

    // Push unmatched return items to shopitems
    const addUnmatchedToShopItems = () => {
        if (unmatchedReturnItems.length > 0) {
            setShopItem((prevShopItems) => [...prevShopItems, ...unmatchedReturnItems]);
        }
    };

    // Effect to add unmatched return items to shopitems when unmatched items are found
    useEffect(() => {
        addUnmatchedToShopItems();
    }, [unmatchedReturnItems]);
    const replaceMatchingItems = () => {
        // Create new array for shopitems with replacements based on serial_number match
        const updatedShopItems = shopitems.map((shopItem) => {
            const matchedReturnItem = returnitems.find(
                (returnItem) => returnItem.serial_number === shopItem.serial_number
            );
            return matchedReturnItem ? { ...shopItem, ...matchedReturnItem } : shopItem;
        });

        // Filter returnitems for those with item_type "spare"
        const spareReturnItems = returnitems.filter(item => item.item_type === "spare");

        // Replace each spareItem with a spareReturnItem if any exist, ignoring serial_number
        const updatedSpareItems = spareitems.map((spareItem, index) => {
            const replacementItem = spareReturnItems[index] || spareItem; // Use spareReturnItem by index if available, else keep original spareItem
            return { ...spareItem, ...replacementItem };
        });

        // Update state with the new arrays
        setShopItem(updatedShopItems);
        setSpareItem(updatedSpareItems);
    };


    // Effect to replace matching items when returnitems change
    useEffect(() => {
        replaceMatchingItems();
    }, [returnitems]);
    return (
        <>
            <ReturnEmailPreviewPage open={openEmailPreview} handleClose={handleEmailPreviewClose} ticketData={ticketData} />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        required
                        multiline
                        label="investigation"
                        name="investigation"
                        value={formData.investigation}
                        onChange={handleChange}
                        fullWidth
                        rows={2}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        required
                        multiline
                        label="solution"
                        name="solution"
                        value={formData.solution}
                        onChange={handleChange}
                        fullWidth
                        rows={2}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DatePicker
                        label="close date"
                        name="close_date"
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                        format="DD/MM/YYYY"
                        value={dayjs(formData.close_date, "YYYY-MM-DD")}
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    close_date: newValue.format('YYYY-MM-DD')
                                })
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TimePicker
                        label="close time"
                        name="close_time"
                        ampm={false}
                        value={dayjs(formData.close_time, 'HH:mm')}
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    close_time: newValue.format('HH:mm')
                                })
                            }
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required: true
                            }
                        }}
                        timeSteps={{
                            minutes: 1
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="item_sn"
                        label="Serial Number"
                        type="text"
                        value={formData.item_sn}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={CategoryOption}
                        getOptionLabel={(option) => option.name}
                        value={CategoryOption.find((category) => category.name === formData.item_category) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    item_category: ""
                                })
                            }
                            const selectedOption = newValue ? newValue.name : null;
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                item_category: selectedOption
                            });
                        }}
                        renderInput={(params) => <TextField required {...params} label="Category" />}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <Autocomplete
                        options={BrandOption}
                        getOptionLabel={(option) => option.name}
                        value={BrandOption.find((brand) => brand.name === formData.item_brand) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    item_brand: ""
                                })
                            }
                            const selectedOption = newValue ? newValue.name : null;
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                item_brand: selectedOption
                            });
                        }}
                        renderInput={(params) => <TextField required {...params} label="Brand" />}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <Autocomplete
                        options={ModelOption}
                        getOptionLabel={(option) => option.name}
                        value={ModelOption.find((model) => model.name === formData.item_model) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    item_model: "",
                                })
                            }
                            const selectedOption = newValue ? newValue.name : null;
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                item_model: selectedOption
                            });
                        }}
                        renderInput={(params) => <TextField required {...params} label="Model" />}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <DatePicker
                        label="warranty expiry"
                        name="warranty_exp"
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                        format="DD/MM/YYYY"
                        value={dayjs(formData.warranty_exp, "YYYY-MM-DD")}
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    warranty_exp: newValue.format('YYYY-MM-DD')
                                })
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Autocomplete
                        options={enginnerOption}
                        getOptionLabel={(option) => `(${option.open_ticket}) ${option.name} ${option.lastname} ${option.distance ?? 'na'} km`}
                        value={enginnerOption.find((engineer) => engineer.id === formData.engineer_id) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    engineer_id: 0,
                                });
                            }
                            const selectedOption = newValue ? newValue.id : 0;
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                engineer_id: selectedOption,
                            });
                        }}
                        renderInput={(params) => <TextField required {...params} label="Engineer" />}
                    />
                </Grid>
            </Grid>
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
                                Item {index + 1} {isItemSaved(item.id || 0) ? <p style={{ color: 'green' }}>Saved</p> : ""}
                            </Typography>
                            <TextField
                                label="Id"
                                value={item.id}
                                sx={{ display: 'none' }}
                            />
                            <TextField
                                disabled={item.id != 0}
                                label="Serial Number"
                                value={item.serial_number}
                                onChange={(e) => handleShopItemChange(index, 'serial_number', e.target.value)}
                                fullWidth
                                size="small"
                                sx={{ '& .MuiInputBase-input': { padding: '8px' }, border: '1px solid #ddd', borderRadius: 1 }}
                            />
                            <Autocomplete
                                disabled={item.id != 0}
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
                                disabled={item.id != 0}
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
                                disabled={item.id != 0}
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
                            <DatePicker
                                label="Warranty Expiry Date"
                                value={dayjs(item.warranty_expire_date)}
                                onChange={(e) => { if (e) handleShopItemChange(index, 'warranty_expire_date', e.format('YYYY-MM-DD')) }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small"
                                    }
                                }}
                                sx={{ '& .MuiInputBase-input': { padding: '8px' }, border: '1px solid #ddd', borderRadius: 1 }}
                            />
                            <Autocomplete
                                size="small"
                                options={store_status}
                                getOptionLabel={(option) => option.name}
                                value={
                                    item.status
                                        ? store_status.find((status) => status.name === item.status)
                                        : store_status[0] || null
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
                        <Stack spacing={2} sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold' }}>
                                No Spare Item
                            </Typography>
                        </Stack>
                    </Grid>
                ) : spareitems.map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Stack spacing={2} sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Item {index + 1} {isItemSaved(item.id || 0) ? <p style={{ color: 'green' }}>Saved</p> : ""}
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
                            <DatePicker
                                label="Warranty Expiry Date"
                                value={dayjs(item.warranty_expire_date)}
                                onChange={(e) => { if (e) handleSpareItemChange(index, 'warranty_expire_date', e.format('YYYY-MM-DD')) }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small"
                                    }
                                }}
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

                            {isItemSaved(item.id || 0) ? <Button variant="outlined" color="error" onClick={() => handleRemoveSpareItem(item)}>Remove</Button> : <></>}
                        </Stack>
                    </Grid>
                ))}
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControlLabel
                    control={<Checkbox checked={formData.resolve_status} onChange={handleChange} />}
                    value={formData.resolve_status}
                    label="Resolved"
                    name="resolve_status"
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Action</FormLabel>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.action?.includes('repair')}
                                    onChange={handleActionChange}
                                    name="repair"
                                />
                            }
                            label="Repair"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.action?.includes('clean')}
                                    onChange={handleActionChange}
                                    name="clean"
                                />
                            }
                            label="Clean"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.action?.includes('spare')}
                                    onChange={handleActionChange}
                                    name="spare"
                                />
                            }
                            label="Spare"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.action?.includes('replace')}
                                    onChange={handleActionChange}
                                    name="replace"
                                />
                            }
                            label="Replace"
                        />
                    </FormGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={9}>
                <TextField
                    disabled={formData.resolve_status}
                    multiline
                    rows={2}
                    required
                    label="Resolve Remark"
                    name="resolve_remark"
                    value={formData.resolve_remark}
                    onChange={handleChange}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <DateTimePicker
                    value={dayjs(formData.time_in)}
                    format="DD/MM/YYYY HH:mm"
                    label="Time in"
                    timeSteps={{
                        minutes: 1
                    }}
                    ampm={false}
                    slotProps={{
                        actionBar: {
                            actions: ['clear', 'today'],
                        },
                        textField: { fullWidth: true, required: true },
                    }}
                    onChange={(date) => setFormData({ ...formData, time_in: date?.toISOString() || "" })}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <DateTimePicker
                    value={dayjs(formData.time_out)}
                    format="DD/MM/YYYY HH:mm"
                    label="Time out"
                    ampm={false}
                    timeSteps={{
                        minutes: 1
                    }}
                    slotProps={{
                        actionBar: {
                            actions: ['clear', 'today'],
                        },
                        textField: { fullWidth: true, required: true },
                    }}
                    onChange={(date) => setFormData({ ...formData, time_out: date?.toISOString() || "" })}
                />
            </Grid>
            <Stack justifyContent={"flex-start"} direction="row" spacing={2}>
                <Typography sx={{ fontSize: 17, color: 'grey', paddingBottom: 1, paddingTop: 1 }}>
                    files
                </Typography>
            </Stack>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <ImageUpload onUpload={handleImageUpload} formdata={formData} setFormData={setFormData} />
                </Grid>
            </Grid>
            <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                <Button onClick={handleClose} variant="contained" color="warning">
                    Close
                </Button>
                <Button startIcon={<EmailOutlined />} onClick={handleEmailPreviewOpen} variant="contained" color="error">
                    Email
                </Button>
                <MenuReturnButton data={ticketData} />
                <Button variant="contained" color="success" onClick={handleSubmit}>
                    Update
                </Button>
            </Stack>
        </>
    )
}