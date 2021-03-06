<?php

declare(strict_types=1);

const MUH_TIMEZONE = 'America/Los_Angeles';

const AQICN_BASE_URL = 'http://api.waqi.info/feed/@3900/';

const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall?lat=37.76829242812971&lon=-122.42288265877234&units=imperial';

const BART_BASE_URL = 'http://api.bart.gov/api/etd.aspx?cmd=etd&orig=16TH&json=y';

const MUNI_BASE_URL = 'https://retro.umoiq.com/service/publicJSONFeed' .
  '?a=sf-muni&command=predictionsForMultiStops';

const MAILDROP_URL_PREFIX = "https://api.maildrop.cc/v2/mailbox/";

const MUNI_STOPS = [
  'J|8059',
  'J|7073',
  'N|4447',
  'N|4448',
  '49|5547',
  '49|5548',
  '14|5547',
  '14|5548',
  '14R|5551',
  '14R|5552',
  '22|3300',
  '22|3301',
];

const MUNI_ROUTE_TO_STOP_NAME = [
  "J" => "Chch/Mrkt",
  "N" => "Chch/Dbce",
  "49" => "14th/Mish",
  "14" => "14th/Mish",
  "14R" => "16th/Mish",
  "22" => "16th/Valn",
];

const MUNI_STOP_TO_WALK_TIME = [
  "Chch/Mrkt" => 10,
  "Chch/Dbce" => 12,
  "14th/Mish" => 5,
  "16th/Mish" => 5,
  "16th/Valn" => 9,
];

const BART_WALK_TIME = 10;

function isAssoc(array $arr)
{
  if (array() === $arr) return false;
  return array_keys($arr) !== range(0, count($arr) - 1);
}

function getValidMinutesString($walk_time, $minutesArr)
{
  return join(", ", array_filter(
    array_map(function ($minutes) use ($walk_time) {
      if ((int)$minutes > $walk_time) {
        return "<span class='attainable-time'>$minutes</span>";
      } else {
        return "";
        //return "<span class='unattainable-time'>$minutes</span>";
      }
    }, $minutesArr),
    function ($val) {
      return $val !== "";
    }
  ));
}

function getDateFromTimeStamp($timestamp, $timezone)
{
  $dt = new DateTime();
  $dt->setTimestamp($timestamp);
  $dt->setTimezone(new DateTimeZone($timezone));
  $datetime = $dt->format('M d');
  return $datetime;
}

function getDateTime()
{
  $dt = new DateTime();
  $dt->setTimezone(new DateTimeZone(MUH_TIMEZONE));
  $datetime = $dt->format('M d, H:i');
  return "<div class='datetime-container'><div class='datetime'>$datetime</div></div>";
}

function getAqiData()
{
  $apiKey = rtrim(file_get_contents('.aqicn_api_key'));

  $requestUri = sprintf(
    '%s?token=%s',
    AQICN_BASE_URL,
    $apiKey
  );

  $fp = fopen($requestUri, 'r');

  $resp = stream_get_contents($fp);

  fclose($fp);

  $o = json_decode($resp, true);

  if (!(array_key_exists('status', $o) && $o['status'] === 'ok')) {
    return 'Error in aqicn!\n';
  }


  $data = $o['data'];

  $aqi = (int) $data["aqi"];
  //$iaqi_info = $data["iaqi"];
  //$dominantpolname = $data["dominentpol"];
  //$dominantpolval = $iaqi_info[$dominantpolname]["v"];
  //$dominantpolname    $dominantpolval \n";

  return "<div id='aqi-container'><div class='prefix'>AQI:</div><div class='aqi'>$aqi</div></div>";
}

function getWeatherData()
{
  $apiKey = rtrim(file_get_contents('.openweathermap_api_key'));

  $requestUri = sprintf(
    '%s&appid=%s',
    OPENWEATHERMAP_BASE_URL,
    $apiKey
  );

  $fp = fopen($requestUri, 'r');

  $resp = stream_get_contents($fp);

  fclose($fp);

  $o = json_decode($resp, true);


  if (!(array_key_exists("current", $o))) {
    return "Error in openweathermap!\n";
  }

  // Weather Alerts
  $timezone = array_key_exists("timezone", $o) ? $o["timezone"] : MUH_TIMEZONE;
  $alertStr = "";
  if (array_key_exists("alerts", $o) && count($o["alerts"]) > 0) {
    $alerts = $o['alerts'];

    $alertStr .= "<div class='weathertable'><table>\n";
    $alertStr .= "<tr> <th>Weather Alert</th> <th>Start</th> <th>End</th> </tr>\n";
    $alertStr .= join("\n", array_map(function ($alert) use ($timezone) {


      $startTime = $alert["start"];
      $endTime = $alert["end"];

      $startTimeStr = getDateFromTimeStamp($startTime, $timezone);
      $endTimeStr = getDateFromTimeStamp($endTime, $timezone);
      $title = $alert["event"];
      return "<tr><td>$title</td><td>$startTimeStr</td><td>$endTimeStr</td></tr>";
    }, $alerts));
    $alertStr .= "</table></div>\n";
  }

  $current = $o['current'];
  $currentTemp = (int) $current['temp'];

  // TODO: this should only be generated once an hour, and then read from here? or just do it on every 60th minute, touch a flag file, whatever
  //$hourly = $o['hourly'];
  //$imgs = join("\n", array_map(function ($hourInfo) {
  //return '<img class="lilmage" src="http://openweathermap.org/img/wn/'.$hourInfo['weather'][0]['icon'].'@2x.png" alt="" width="20">';
  //}, $hourly));
  //

  $today = $o['daily'][0];
  [
    "day" => $tempDay,
    "min" => $tempMin,
    "max" => $tempMax,
    "night" => $tempNight,
    "eve" => $tempEve,
    "morn" => $tempMorn,
  ] = $today['temp'];

  // Don't bother displaying floats of temperatures
  [$tempDay, $tempMin, $tempMax, $tempNight, $tempEve, $tempMorn] = array_map(
    function ($str) {
      return round($str);
    },
    [$tempDay, $tempMin, $tempMax, $tempNight, $tempEve, $tempMorn]
  );

  // UV Index
  $uvNow = round($current["uvi"]);
  $uvToday = round($today["uvi"]);


  // TODO: fix today display
  return "
  <div class='temperature-container'><div class='prefix'>Temp:</div><div class='temperature'>$currentTemp <i> ($tempMin/$tempMax)</i></div></div>
  <div class='uvi-container'><div class='prefix'>UV Index:</div><div class='uvi'>$uvNow <div class='prefix'>Today:</div> $uvToday</div></div>
  \n$alertStr\n";
}

function getBARTData()
{
  $apiKey = rtrim(file_get_contents('.bart_api_key'));

  $requestUri = sprintf(
    '%s&key=%s',
    BART_BASE_URL,
    $apiKey
  );

  $fp = fopen($requestUri, 'r');

  $resp = stream_get_contents($fp);

  fclose($fp);

  $o = json_decode($resp, true);

  if (!array_key_exists('root', $o) //|| array_key_exists('error', $o['root']['message'])
  ) {

    return "Error in BART! \n";
  }

  if (
    array_key_exists('message', $o['root']) &&
    $o['root']['message'] !== '' &&
    array_key_exists('warning', $o['root']['message']) &&
    $o['root']['message']['warning'] === "No data matched your criteria."
  ) {
    return '';
    //return '<div class="nobart">No BART trains found.</div>';
  }

  $etd = $o['root']['station'][0]['etd'];

  $table_contents = "";

  $valid_trips = array();
  foreach ($etd as $dest) {
    $dest_name = $dest["destination"];

    $estimates = $dest["estimate"];

    // Always the same, so just use the last one
    foreach ($estimates as $est) {
      $minutes = $est["minutes"];
      if ($minutes === "Leaving") {
        $minutes = 0;
      }
      if (!array_key_exists($dest_name, $valid_trips)) {
        $valid_trips[$dest_name] = [];
        $valid_trips[$dest_name]['minutes'] = [];
        $valid_trips[$dest_name]['minutes'] = [];
        $valid_trips[$dest_name]['direction'] = $est['direction'];
      }
      array_push($valid_trips[$dest_name]['minutes'], $minutes);
    }
  }

  uasort($valid_trips, function ($a, $b) {
    return $a['direction'] > $b['direction'];
  });

  foreach ($valid_trips as $dest_name => $dest_info) {
    ['minutes' => $minutesArr, 'direction' => $direction] = $dest_info;

    sort($minutesArr);
    $minutesStr = getValidMinutesString(BART_WALK_TIME, $minutesArr);

    if (strlen($minutesStr) > 0) {
      $table_contents .= "<tr>";
      $table_contents .= "<td>$direction</td>";
      $table_contents .= "<td>$dest_name</td>";
      $table_contents .= "<td>$minutesStr</td>";
      $table_contents .= "</tr>\n";
    }
  }

  $bart_table_header = '
  <table border="1">
  <tr>
    <th>Dir</th>
    <th>Dest</th>
    <th>Min</th>
  </tr>';

  $bart_table_footer = '</table>';
  return "<div class='barttable'>$bart_table_header $table_contents $bart_table_footer</div>";
}


function getMuniData()
{
  $makeStop = function ($pair) {
    return "&stops=$pair";
  };

  $muniURL = MUNI_BASE_URL . join(array_map($makeStop, MUNI_STOPS));

  $fp = fopen($muniURL, 'r');

  $resp = stream_get_contents($fp);

  fclose($fp);

  $o = json_decode($resp, true);

  if (array_key_exists("Error", $o) || !array_key_exists("predictions", $o)) {
    return 'Error in Muni!\n';
  }

  $valid_trips = array();
  $allpredictions = $o['predictions'];
  foreach ($allpredictions as $route) {
    if (array_key_exists("dirTitleBecauseNoPredictions", $route)) {
      continue;
    }
    $route_tag = $route['routeTag'];
    $stop = MUNI_ROUTE_TO_STOP_NAME[$route_tag];

    $alldirections = $route['direction'];
    if (!isAssoc($alldirections)) {
      foreach ($alldirections as $direction) {
        $minutes = getMuniPredictionMinutes($direction);
        $dest_name = $direction['title'];
        array_push($valid_trips, [$stop, $dest_name, $route_tag, $minutes]);
      }
    } else {
      $direction = $alldirections;
      $dest_name = $direction['title'];
      $minutes = getMuniPredictionMinutes($direction);
      array_push($valid_trips, [$stop, $dest_name, $route_tag, $minutes]);
    }
  }

  sort($valid_trips);

  $table_contents = "";
  foreach ($valid_trips as [$stop, $dest_name, $route_tag, $minutesArr]) {
    sort($minutesArr);
    $minutesStr = getValidMinutesString(MUNI_STOP_TO_WALK_TIME[$stop], $minutesArr);

    if (strlen($minutesStr) > 0) {
      $direction_name = explode(' ', $dest_name, 2)[0];

      $table_contents .= "<tr>";
      $table_contents .= "<td>$stop</td>";
      $table_contents .= "<td>$direction_name</td>";
      $table_contents .= "<td>$route_tag</td>";
      $table_contents .= "<td>$minutesStr</td>";
      $table_contents .= "</tr>\n";
    }
  }

  $muni_table_header = '
  <table border="1">
  <tr>
    <th>Stop</th>
    <th>Dir</th>
    <th>Bus</th>
    <th>Min</th>
  </tr>';

  $muni_table_footer = '</table>';

  return "<div class='munitable'>$muni_table_header $table_contents $muni_table_footer</div>";
}

function getMuniPredictionMinutes($direction)
{
  $allMinutes = [];
  $predictions = $direction['prediction'];

  if (!isAssoc($predictions)) {
    foreach ($predictions as $prediction) {
      $minutes = $prediction['minutes'];
      array_push($allMinutes, $minutes);
    }
  } else {
    $prediction = $predictions;
    $minutes = $prediction['minutes'];
    array_push($allMinutes, $minutes);
  }

  return $allMinutes;
}

function getEmails()
{
  $maildropEmailAddr = rtrim(file_get_contents('.maildropcc_email_addr'));
  $maildropApiUrl = MAILDROP_URL_PREFIX . $maildropEmailAddr;

  $header = "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0
x-api-key: QM8VTHrLR2JloKTJMZ3N6Qa93FVsx8LapKCzEjui
Connection: close";

  $opts =  ['http' =>
  [
    "referrer" => "https://maildrop.cc/",
    "header" => $header,
    "method" => "GET",
    "mode" => "cors"
  ]];

  $context = stream_context_create($opts);
  $stream = fopen($maildropApiUrl, 'r', false, $context);
  $resp = stream_get_contents($stream);
  $o = json_decode($resp, true);

  if (!array_key_exists('messages', $o)) {
    return 'Error in maildrop!\n';
  }

  $messages = $o['messages'];
  if (count($messages) < 1) {
    return '';
  }
  $output = "<div class='alerttable'><table><tr><th>Alert</th></tr>";
  foreach ($messages as $message) {
    $subject = $message['subject'];
    $output .= "<tr><td>$subject</td></tr>";
  }
  $output .= "</table></div>";
  return $output;
}


function printAllDataSync($iteration)
{
  static $weathercache = "";
  static $aqicache = "";
  static $emailcache = "";

  if (($iteration % 10) === 0) {
    fwrite(STDERR, "c");

    $wd = getWeatherData();
    $weathercache = $wd;

    $cnaqi = getAqiData();
    $aqicache = $cnaqi;
  } else {
    fwrite(STDERR, "u");

    $wd = $weathercache;
    $cnaqi = $aqicache;
  }

  if (($iteration % 5) === 0) {
    $emails = getEmails();
    $emailcache = $emails;
  } else {
    $emails = $emailcache;
  }

  $bart = getBARTData();
  $muni = getMuniData();

  $datetime = getDateTime();

  print "
$datetime
$emails
$cnaqi
$wd
$bart
$muni
";
}
