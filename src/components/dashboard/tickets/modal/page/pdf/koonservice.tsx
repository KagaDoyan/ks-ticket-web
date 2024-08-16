export default function CraeteKoonServiceForm(data: any) {
  var html_format = `
   <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Koon Service Form</title>
        <style>
          body, html {
                margin: 0;
                padding: 0;
                height: 100%;
            }

            /* Container to mimic an A4 paper */
            .a4-page {
                width: 210mm;
                height: 297mm;
                margin: auto;
                padding: 20mm;
                box-sizing: border-box;
                background: white;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
            }

            /* Content within the page */
            .content {
                flex: 1;
                font-family: Arial, sans-serif;
            }

            /* Responsive scaling */
            @media screen and (max-width: 210mm), screen and (max-height: 297mm) {
                .a4-page {
                    transform: scale(0.8);
                    transform-origin: top left;
                }
            }

            @media screen and (max-width: 168mm), screen and (max-height: 238mm) {
                .a4-page {
                    transform: scale(0.6);
                    transform-origin: top left;
                }
            }

            /* Additional styles for print */
            @media print {
                body, html {
                    margin: 0;
                    padding: 0;
                    height: auto;
                    body { margin: 1.6cm; }
                }

                .a4-page {
                    box-shadow: none;
                    margin: 0;
                    padding: 0;
                    width: auto;
                    height: auto;
                    transform: none;
                }
                @page { margin: 0; }
            }
        </style>
    </head>
    <body>
         <img src="' . $inputImageBase64 . '" style="position: absolute; top:0;margin-left:-20; padding: 0; width: 117%; height: 100%;">



<div id="customer_ticket_no" style="font-size:12px;position: absolute; top:105px; left: 565px;">'.$data[0]['inc_number'].'</div>

<div id="ticket_no" style="font-size:12px;position: absolute; top:105px; left: 695px;">'.$data[0]['ticket_number'].'</div>


<div id="dd" style="font-size:12px;position: absolute; top:130px; width:40px;left: 537px;">'.$day.'</div>

<div id="mm" style="font-size:12px;position: absolute; top:130px; width:40px;left: 562px;">'.$month.'</div>

<div id="yyyy" style="font-size:12px;position: absolute; top:130px; left: 583px;">'.$year.'</div>

<div id="time" style="font-size:12px;position: absolute; top:130px; left: 633px;">'.$data[0]['ticket_time'].'</div>






<div style="font-size:14px;position: absolute; top:177px; left: 160px;">'.$data[0]['customer_name'].'</div>

<div style="font-size:14px;position: absolute; top:175px; left: 525px;">'.$data[0]['customer_name'].'</div>







<div style="font-size:14px;position: absolute; top:205px; left: 130px;">'.$data[0]['store_name'].'</div>

<div style="font-size:14px;position: absolute; top:205px; left: 525px;">'.$data[0]['store_contactphone'].'</div>






<div id="reportby" style="font-size:14px;position: absolute; top:230px; left: 210px;">'.$data[0]['store_name'].'</div>

<div id="mobile1" style="font-size:14px;position: absolute; top:230px; left: 525px;">COMPANY. ทดสอบ</div>






<div id="email" style="font-size:14px;position: absolute; top:257px; left: 140px;">'.$data[0]['store_email'].'</div>

<div id="mobile2" style="font-size:14px;position: absolute; top:257px; left: 535px;">        -    </div>
 








<div id="contact" style="font-size:14px;position: absolute; top:285px; left: 200px;">-</div>

<div id="address" style="font-size:14px;position: absolute; top:285px; left: 540px;">'.$data[0]['store_address'].'</div>








<div id="brand" style="font-size:14px;position: absolute; top:330px; left: 150px;">'.$data[0]['ticket_service_brand'].'</div>


<div id="model" style="font-size:14px;position: absolute; top:330px; left: 505px; width:100px;">'.$data[0]['ticket_service_model'].'</div>







<div id="equipment" style="font-size:14px;position: absolute; top:360px; left: 230px;">'.$data[0]['ticket_service_equipment'].'</div>


<div id="sn" style="font-size:14px;position: absolute; top:360px; left: 560px;">'.$data[0]['ticket_service_sn'].'</div>








<div id="expired" style="font-size:14px;position: absolute; top:388px; left: 210px;">'.$data[0]['ticket_service_expire'].'</div>


<div id="sla" style="width:40px;font-size:14px;position: absolute; top:390px; left: 530px;">'.$data[0]['priority_name'].'</div>








<div id="desciption" style="font-size:14px;position: absolute; top:438px; left: 40px;">'.$data[0]['ticket_description'].'</div>






<div id="ticketdesciption" style="font-size:14px;position: absolute; top:500px; left: 280px;">'.$data[0]['ticket_problem_found'].'</div>







<div id="solution" style="font-size:14px;position: absolute; top:550px; left: 190px;">'.$data[0]['ticket_fix_detail'].'</div>



'. $statusHtml.'




<div id="resoltext" style="font-size:14px;position: absolute; top:614px; left: 515px;">'.$data[0]['ticket_status_detail'].' </div>







<div id="resolend" style="font-size:12px;position: absolute; top:658px; left: 177px;"><img src="'.$check_img.'"></div>

<!--<div id="resolend" style="font-size:12px;position: absolute; top:658px; left: 285px;"><img src="'.$check_img.'"></div>-->


<!--<div id="resolend" style="font-size:12px;position: absolute; top:658px; left: 438px;"><img src="'.$check_img.'"></div>-->


<!--<div id="resolend" style="font-size:12px;position: absolute; top:658px; left: 618px;"><img src="'.$check_img.'"></div>-->








<!--<div id="resolend" style="font-size:12px;position: absolute; top:674px; left: 530px;">20-03-2023</div>-->






<div id="spare1" style="font-size:14px;position: absolute; top:725px; left: 40px; width:100px;">'.$data[0]['catagory_name'].'</div>




<div id="spare2" style="font-size:14px;position: absolute; top:725px; left: 190px;">'.$data[0]['device_id'].'</div>


<div id="spare3" style="font-size:14px;position: absolute; top:725px; left: 295px;">'.$data[0]['device_id'].'</div>



<div id="spare4" style="font-size:14px;position: absolute; top:725px; left: 410px;">'.$data[0]['device_sn'].'</div>


<div id="spare5" style="font-size:14px;position: absolute; top:725px; left: 530px;">'.$data[0]['device_replace_id'].'</div>



<div id="spare6" style="font-size:14px;position: absolute; top:725px; left: 650px;">'.$data[0]['device_replace_sn'].'</div>

        <script>
            window.onload = function() {
                window.print();
            }
        </script>
    </body>
    </html>`
  return html_format
}