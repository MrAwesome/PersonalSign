<?php function headBody() {
?>
<!DOCTYPE html>
<meta http-equiv="refresh" content="10">
<head>
  <title>The B</title>
  <script>
    window.setInterval("refresh()", 60000);

    function refresh() {
        window.location.reload();
    }
    </script>
  <style>

    body {
      background: black;
      color: white;
    }
    table{
      border-collapse: collapse;
      border: 1px solid #333333;
      border-radius: 5px;
    }

    table td {
      border: 1px solid #333333;
      padding-left: 5px;
      padding-right: 5px;
    }

    table th {
      border: 1px solid #333333;
    }

    .lilmage {
      border: 1px solid #333333;
      background: lightgrey;
    }

    .attainable-time {
      font-weight: bold;
    }

    .unattainable-time {
      font-style: italic;
      color: #888888;
    }

    .uvi {
      padding: 2px;
      border: 1px solid #333333;
      display: inline-block;
    }

    .aqi {
      padding: 2px;
      border: 1px solid #333333;
      display: inline-block;
    }
    .temperature {
      padding: 2px;
      border: 1px solid #333333;
      display: inline-block;
    }

    .alerttable {
      padding-bottom: 15px;
    }

    .weathertable, .munitable, .barttable {
      padding-top: 8px;
    }

    .datetime {
      font-size: 48px;
    }

  </style>
</head>
<body>
<?php } function endBody() { ?>
  </body>
<?php } ?>
