import dayjs from "dayjs";

export default function CraeteKoonServiceReturnForm(form: string, data: any) {
    var spareParts = ''
    var FormName = ''
    var logo = ''


    switch (form) {
        case 'koon':
            FormName = 'Koon Service'
            logo = `<img
            id="logo"
            src="${process.env.NEXT_PUBLIC_API_URL}/assets/ks.png"
            alt="Logo" width="150" height="70">`
            break
        case 'advice':
            FormName = 'Advice Service'
            logo = `<img
              id="logo"
              src="${process.env.NEXT_PUBLIC_API_URL}/assets/av.png"
              alt="Logo" width="70" height="70" style="top: 2px; left: 2px; right: 2px; bottom: 2px">`
            break
        case 'tcc':
            FormName = 'TCCtech Service'
            logo = `<img
            id="logo"
            src="${process.env.NEXT_PUBLIC_API_URL}/assets/tcc.png"
            alt="Logo" width="130" height="70" style="top: 2px; left: 2px; right: 2px; bottom: 2px">`
            break
        default:
            FormName = 'Koon Service'
    }
    if (data.spare_item != null && data.store_item != null) {
        // const unmatchedReturnItems = data.return_item.filter(
        //     (returnItem: any) => !data.store_item.some((item: any) => item.serial_number === returnItem.serial_number)
        // );
        // data.store_item.push(...unmatchedReturnItems)
    
        // Filter items based on the conditions
        const deviceListClean = data.return_item.filter(
            (element: any) =>
                element.item_type === "spare" &&
                (element.status === "return" || element.status === "replace")
        );
        const replaceDeviceListClean = data.return_item.filter(
            (element: any) =>
                element.item_type === "store" &&
                (element.status === "return" || element.status === "replace")
        );
    
        // Group items by category
        const groupedData: Record<string, { spare: any[]; store: any[] }> = {};
    
        deviceListClean.forEach((item:any) => {
            const category = item.category || "Uncategorized";
            if (!groupedData[category]) groupedData[category] = { spare: [], store: [] };
            groupedData[category].spare.push(item);
        });
    
        replaceDeviceListClean.forEach((item:any) => {
            const category = item.category || "Uncategorized";
            if (!groupedData[category]) groupedData[category] = { spare: [], store: [] };
            groupedData[category].store.push(item);
        });
    
        // Generate rows
    
        Object.keys(groupedData).forEach((category) => {
            const { spare, store } = groupedData[category];
            const maxRows = Math.max(spare.length, store.length);
    
            for (let i = 0; i < maxRows; i++) {
                spareParts += `
                <tr>
                    <td style="word-wrap: break-word; overflow-wrap: break-word;">
                        ${category}
                    </td>
                    <td style="word-wrap: break-word; overflow-wrap: break-word;"></td>
                    <td style="word-wrap: break-word; overflow-wrap: break-word;">
                        ${spare[i]?.brand || "_"}
                    </td>
                    <td style="word-wrap: break-word; overflow-wrap: break-word;">
                        ${spare[i]?.serial_number || "_"}
                    </td>
                    <td style="word-wrap: break-word; overflow-wrap: break-word;">
                        ${store[i]?.brand || "_"}
                    </td>
                    <td style="word-wrap: break-word; overflow-wrap: break-word;">
                        ${store[i]?.serial_number || "_"}
                    </td>
                </tr>`;
            }
        });
    }
    var html_format = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        b {
            font-weight: bold;
        }

        underline {
            text-decoration: underline;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .form-container {
            width: 210mm;
            /* A4 width */
            margin: 0 auto;
            padding: 10mm;
            box-sizing: border-box;
            background-color: #fff;
        }

        table {
            font-size: 12px;
            width: 100%;
            table-layout: fixed;
            /* Ensure consistent column width */
        }

        td,
        th {
            padding: 5px;
            box-sizing: border-box;
            text-align: left;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            /* border: 1px solid black; */
        }

        .nested-table {
            width: 100%;
        }

        /* Ensure consistent row height and avoid page breaks inside rows */
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                background-color: white;
            }

            header,
            footer {
                display: none;
            }

            .form-container {
                width: 100%;
                margin: 0;
                padding: 10mm;
                border: none;
            }

            table {
                width: 100%;
            }

            @page {
                size: A4;
                margin: 0;
            }
        }
    </style>
</head>

<body>
    <div class="form-container">
        <table class="header-table">
            <tbody>
                <!-- Header Row -->
                <tr>
                    <td colspan="5" style="border: 1px solid black; text-align: center;">${logo}</td>
                    <td colspan="10"
                        style="border: 1px solid black; font-size: 20px; font-weight: bold; text-align: center;">${FormName}</td>
                    <td colspan="10" style="border: 1px solid black;">
                        <table class="nested-table">
                            <tbody>
                                <tr>
                                    ${form != 'tcc' ? `<td colspan="2"><b>Ticket No:</b> ${data?.ticket_number}</td>` : `<td colspan="2"><b>Incident No:</b> ${data?.inc_number}</td>`}
                                </tr>
                                <tr>
                                    <td colspan="2"><b>Report Date:</b> ${dayjs(new Date()).format("DD-MM-YYYY")} <b>Time:</b> ${dayjs(new Date()).format("HH:MM")} </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>

                <!-- Section 1 -->
            <tbody style="border: 1px solid black;">
                ${form != 'tcc' ? `                <tr>
                    <td colspan="12"><b>ลูกค้า / customer:</b>
                        <underline>${data.customer.fullname}</underline>
                    </td>
                </tr>` : ''}
                <tr>
                    <td colspan="12"><b>สาขา / shop:</b>
                        <underline>${data.shop.shop_number + ' ' + data.shop.shop_name}</underline>
                    </td>
                    <td colspan="12"><b>โทรศัพท์ / phone:</b>
                        <underline>${data.shop.phone}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>ผู้รับแจ้งปัญหา / reported by:</b>
                        <underline>${data.shop.shop_name}</underline>
                    </td>
                    <td colspan="12"><b>มือถือ/mobile 1:</b>
                        <underline>${data.shop.phone}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>Email address:</b>
                        <underline>${data.shop.email}</underline>
                    </td>
                    <td colspan="12"><b>มือถือ / Mobile 2:</b>
                        <underline></underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>บุคคลติดต่อ / Contact:</b>
                        <underline>${data.contact_name || ''}</underline>
                    </td>
                    <td colspan="12"><b>สถานที่ตั้ง / Address:</b>
                        <underline>${data.shop.location_name || ''}</underline>
                    </td>
                </tr>
            </tbody>

            <!-- Section 2 -->
            <tbody style="border: 1px solid black;">
                <tr>
                    <td colspan="12"><b>สินค้า/Brand :</b>
                        <underline>${data.return_ticket.item_brand}</underline>
                    </td>
                    <td colspan="12"><b>รุ่น / Model :</b>
                        <underline>${data.return_ticket.item_model}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>อุปกรณ์ที่แจ้งเสีย/Equipment :</b>
                        <underline>${data.return_ticket.item_category}</underline>
                    </td>
                    <td colspan="12"><b>หมายเลขเครื่อง S/N :</b>
                        <underline>${data.return_ticket.item_sn}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>วันที่หมดประกัน/Expired :</b>
                        <underline>${data.return_ticket.warranty_exp}</underline>
                    </td>
                    <td colspan="12"><b>เงื่อนไข / SLA :</b>
                        <underline>${data.sla_priority_level}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="24" style="overflow-wrap: break-word; word-wrap: break-word;"><b>รายละเอียด ของอาการเสียที่แจ้ง/ Description :</b>
                        <underline>${data.description.replace(/\n/g, '<br>')}</underline>
                    </td>
                </tr>
            </tbody>
            <!-- Section 3 -->
            <tbody style="border: 1px solid black;">
                <tr>
                    <td colspan="24" style="overflow-wrap: break-word; word-wrap: break-word;">
                        ปัญหาที่ตรวจพบ / Ticket Description: <underline>${data.return_ticket.investigation}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="24" style="overflow-wrap: break-word; word-wrap: break-word;">
                        วิธีแก้ปัญหา / Solution: <underline>${data.return_ticket.solution}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="7" style="text-align: left; vertical-align: top;">
                      ปัญหาได้รับการแก้ไข / Resolved:
                    </td>
                    <td colspan="3" style="text-align: left; vertical-align: top;">
                      <input 
                        onclick="return false;"
                        type="checkbox" 
                        id="resolved1" 
                        name="resolved" 
                        value="resolved" 
                      <label for="resolved1">แก้ไขจบ</label>
                    </td>
                    <td colspan="14" style="text-align: left; vertical-align: top;">
                      <input 
                        onclick="return false;"
                        type="checkbox" 
                        id="resolved2" 
                        name="resolved" 
                        value="notresolved"
                      <label for="resolved2">
                        ยังไม่เสร็จ เนื่องจาก (ระบุสาเหตุ):
                      </label>
                      <u style="overflow-wrap: break-word;">${data.return_ticket.resolve_status ? '' : data.return_ticket.resolve_remark}</u>
                    </td>
                    <script>
                          const checkbox1 = document.getElementById('resolved1');
                          const checkbox2 = document.getElementById('resolved2');

                          // Compare the values
                          if ("${data.return_ticket.resolve_status}" === "true") {
                            checkbox1.checked = true;
                          } else {
                            // If values don't match, you can choose to uncheck or leave as is
                            checkbox2.checked = true;
                          }
                    </script>
                </tr>
                <tr>
                    <tr>
                        <td colspan="4" style="vertical-align: top;">วิธีดำเนินการ/Action:</td>
                        <td colspan="4" style="vertical-align: top;">
                            <input type="checkbox" id="action1" name="action" value="repair" onclick="return false;">
                            <label for="action1">ซ่อม / Repair</label>
                        </td>
                        <td colspan="6" style="vertical-align: top;">
                            <input type="checkbox" id="action2" name="action" value="clean" onclick="return false;">
                            <label for="action2">ทำความสะอาด / Clean </label>
                        </td>
                        <td colspan="6" style="vertical-align: top;">
                            <input type="checkbox" id="action3" name="action" value="spare" onclick="return false;">
                            <label for="action3">เปลี่ยนชั่วคราว / Temporary</label>
                        </td>
                        <td colspan="4" style="vertical-align: top;">
                            <input type="checkbox" id="action4" name="action" value="replace" onclick="return false;">
                            <label for="action4">เปลี่ยนถาวร / Permanent</label>
                        </td>
                    </tr>

                    <script>
                            const actions = "${data.return_ticket.action}".split(',').map(action => action.trim());
                            // Reference the checkboxes
                            const action1 = document.getElementById('action1');
                            const action2 = document.getElementById('action2');
                            const action3 = document.getElementById('action3');
                            const action4 = document.getElementById('action4');
                            const isChecked = (action) => actions.includes(action);

                            // Set the checked state based on the action values
                            if (action1) action1.checked = isChecked("repair");
                            if (action2) action2.checked = isChecked("clean");
                            if (action3) action3.checked = isChecked("spare");
                            if (action4) action4.checked = isChecked("replace");
                    </script>
                </tr>
                <!-- Spare Parts -->
                <tr>
                    <td colspan="25" style="background-color: bisque;">
                        <table width="100%" border="1px solid black">
                            <thead>
                                <tr>
                                    <th style="text-align: center; vertical-align: top;">อะไหล่ / Spare Part</th>
                                    <th style="text-align: center; vertical-align: top;">Asset No.</th>
                                    <th style="text-align: center; vertical-align: top;">Brand Model </br> (เครื่องเดิม)
                                    </th>
                                    <th style="text-align: center; vertical-align: top;">Serial No. </br> (เครื่องเดิม)
                                    </th>
                                    <th style="text-align: center; vertical-align: top;">Brand Model </br> (เครื่องใหม่)
                                    </th>
                                    <th style="text-align: center; vertical-align: top;">Serial No. </br> (เครื่องใหม่)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                             ${spareParts}
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
            <!-- Signatures -->
            <tbody style="border: 1px solid black;">
                <tr>
                    <td colspan="12" style="text-align: center; vertical-align: top; border-right: 1px solid #000;">
                        ตราประทับ/ Stamp :
                    </td>
                    <td colspan="13">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border: none;">
                                <td style="text-align: right;" colspan="2">ผู้รับบริการ/ Customer Sign:</td>
                                <td colspan="2"></td>
                            </tr>
                            <tr style="border: none;"> 
                                <td style="text-align: right;" colspan="2">ผู้ให้บริการ/ Service Sign:</td>
                                <td colspan="2"></td>
                            </tr style="border: none;">
                            <tr style="border: none;">
                                <td style="text-align: right;" colspan="2">วันที่ / Date:</td>
                                <td colspan="2">${dayjs(data.return_ticket.time_in).format('DD-MM-YYYY')}</td>
                            </tr>
                            <tr>
                            <tr style="border-top: 1px solid #000;">
                                <td style="text-align: center; border-right: 1px solid #000;" colspan="2">เวลาเข้างาน/ Time In:</td>
                                <td style="text-align: center;" colspan="2">เวลาออกงาน / Time Out:</td>
                            </tr>
                            <tr style="border: none;">
                                <td style="text-align: center; border-right: 1px solid #000;" colspan="2">${dayjs(data.return_ticket.time_in).format('DD-MM-YYYY HH:mm')}</td>
                                <td style="text-align: center;" colspan="2">${dayjs(data.return_ticket.time_out).format('DD-MM-YYYY HH:mm')}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <script>
        // Wait for the logo image to load
        const logoImage = document.getElementById('logo');

        logoImage.onload = function () {
            // Open the print window after the image is loaded
            window.print();
        };

        logoImage.onerror = function () {
            console.error("Logo failed to load.");
            // Proceed with print even if logo fails to load
            window.print();
        };
    </script>
</body>

</html>`
    return html_format
}