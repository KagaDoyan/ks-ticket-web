export default function CraeteKoonServiceForm(data: any) {
  var spareParts = ''
  console.log(data.spare_item[0].category);
  
  for (var i = 0; i < 5; i++) {
    spareParts += `
     <tr>
    <td style="word-wrap: break-word; overflow-wrap: break-word;">
      ${data.spare_item[i] ? data.spare_item[i].category || "" : "_"}
    </td>
    <td style="word-wrap: break-word; overflow-wrap: break-word;"></td>
     <td style="word-wrap: break-word; overflow-wrap: break-word;">
     ${data.store_item[i] ? data.store_item[i].brand || "" : "_"}
    </td>
    <td style="word-wrap: break-word; overflow-wrap: break-word;">
      ${data.store_item[i] ? data.store_item[i].serial_number || "" : "_"}
    </td>
    <td style="word-wrap: break-word; overflow-wrap: break-word;">
      ${data.spare_item[i] ? data.spare_item[i].brand || "" : "_"}
    </td>
    <td style="word-wrap: break-word; overflow-wrap: break-word;">
      ${data.spare_item[i] ? data.spare_item[i].serial_number || "" : "_"}
    </td>
   </tr>`                             
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
                    <td colspan="5" style="border: 1px solid black; text-align: center;"><img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYYWXb3U7rPHkcZFACKdbTbEIo0k0n6d7Mtg&s"
                            alt="Logo" width="70" height="70"></td>
                    <td colspan="10"
                        style="border: 1px solid black; font-size: 20px; font-weight: bold; text-align: center;">Advice
                        Services</td>
                    <td colspan="10" style="border: 1px solid black;">
                        <table class="nested-table">
                            <tbody>
                                <tr>
                                    <td colspan="2"><b>Ticket No:</b> ${data.ticket_number}</td>
                                </tr>
                                <tr>
                                    <td colspan="2"><b>Report Date:</b> 12/12/2022 <b>Time:</b> 15:00</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>

                <!-- Section 1 -->
            <tbody style="border: 1px solid black;">
                <tr>
                    <td colspan="12"><b>สาขา / shop:</b>
                        <underline>${data.shop.shop_name}</underline>
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
                        <underline>${data.item_brand}</underline>
                    </td>
                    <td colspan="12"><b>รุ่น / Model :</b>
                        <underline>${data.item_model}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>อุปกรณ์ที่แจ้งเสีย/Equipment :</b>
                        <underline>${data.item_category}</underline>
                    </td>
                    <td colspan="12"><b>หมายเลขเครื่อง S/N :</b>
                        <underline>${data.item_sn}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="12"><b>วันที่หมดประกัน/Expired :</b>
                        <underline>${data.warranty_exp}</underline>
                    </td>
                    <td colspan="12"><b>เงื่อนไข / SLA :</b>
                        <underline>${data.sla_priority_level}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="24"><b>รายละเอียด ของอาการเสียที่แจ้ง/ Description :</b>
                        <underline>${data.description}</underline>
                    </td>
                </tr>
            </tbody>
            <!-- Section 3 -->
            <tbody style="border: 1px solid black;">
                <tr>
                    <td colspan="24">
                        ปัญหาที่ตรวจพบ / Ticket Description: <underline>${data.investigation}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="24">
                        วิธีแก้ปัญหา / Solution: <underline>${data.solution}</underline>
                    </td>
                </tr>
                <tr>
                    <td colspan="7" style="text-align: left;">
                      ปัญหาได้รับการแก้ไข / Resolved:
                    </td>
                    <td colspan="3" style="text-align: left;">
                      <input 
                        type="checkbox" 
                        id="resolved1" 
                        name="resolved" 
                        value="resolved" 
                      <label for="resolved1">แก้ไขจบ</label>
                    </td>
                    <td colspan="14" style="text-align: left;">
                      <input 
                        type="checkbox" 
                        id="resolved2" 
                        name="resolved" 
                        value="notresolved"
                      <label for="resolved2">
                        ยังไม่เสร็จ เนื่องจาก (ระบุสาเหตุ):
                      </label>
                      <u>${data.resolve_status ? '' : data.resolve_remark}</u>
                    </td>
                    <script>
                          const checkbox1 = document.getElementById('resolved1');
                          const checkbox2 = document.getElementById('resolved2');

                          // Compare the values
                          if ("${data.resolve_status}" === "true") {
                            checkbox1.checked = true;
                          } else {
                            // If values don't match, you can choose to uncheck or leave as is
                            checkbox2.checked = true;
                          }
                    </script>
                </tr>
                <tr>
                    <td colspan="4" style="vertical-align: top;">วิธีดำเนินการ/Action:</td>
                    <td colspan="4" style="vertical-align: top;">
                        <input type="checkbox" id="action1" name="action" value="repair">
                        <label for="action1">ซ่อม / Repair</label>
                    </td>
                    <td colspan="6" style="vertical-align: top;">
                        <input type="checkbox" id="action2" name="action" value="clean">
                        <label for="action2">ทำความสะอาด / Clean </label>
                    </td>
                    <td colspan="6" style="vertical-align: top;">
                        <input type="checkbox" id="action3" name="action" value="spare">
                        <label for="action3">เปลี่ยนชั่วคราว / Temporary</label>
                    </td>
                    <td colspan="4" style="vertical-align: top;">
                        <input type="checkbox" id="action4" name="action" value="replace">
                        <label for="action4">เปลี่ยนถาวร / Permanent</label>
                    </td>
                    <script>
                          const action1 = document.getElementById('action1');
                          const action2 = document.getElementById('action2');
                          const action3 = document.getElementById('action3');
                          const action4 = document.getElementById('action4');
                          // Compare the values
                          switch ("${data.action}") {
                            case "repair":
                              action1.checked = true;
                              break;
                            case "clean":
                              action2.checked = true;
                              break;
                            case "spare":
                              action3.checked = true;
                              break;
                            case "replace":
                              action4.checked = true;
                              break;
                            default:
                              break;
                          }
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
                                <td colspan="2"></td>
                            </tr>
                            <tr>
                            <tr style="border-top: 1px solid #000;">
                                <td style="text-align: center; border-right: 1px solid #000;" colspan="2">เวลาเข้างาน/ Time In:</td>
                                <td style="text-align: center;" colspan="2">เวลาออกงาน / Time Out:</td>
                            </tr>
                            <tr style="border: none;">
                                <td style="text-align: center; border-right: 1px solid #000;" colspan="2">${data.time_in}</td>
                                <td style="text-align: center;" colspan="2">${data.time_out}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <script>
        window.print();
    </script>
</body>

</html>`
  return html_format
}