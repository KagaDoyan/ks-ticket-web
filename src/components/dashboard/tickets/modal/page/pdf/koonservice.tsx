export default function CraeteKoonServiceForm(data: any) {
    var html_format = `
    <html>
        <head>
          <title>Print Page</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            label {
              font-weight: bold;
            }
            input {
              margin-bottom: 10px;
              padding: 5px;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <h1>Print Page</h1>
          <form>
            <label>Name:</label>
            <input type="text" name="name" value="${data.name}" readonly />
            <br />
            <label>Email:</label>
            <input type="email" name="email" value="${data.email}" readonly />
            <br />
            <!-- Add more fields as needed -->
          </form>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
    </html>`
    return html_format
}