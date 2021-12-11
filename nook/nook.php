<?php
declare(strict_types=1);

if (count($argv) < 2 || count($argv) > 2) {
  echo "Usage: php " . $argv[0] . " <target_filename>";
  exit(1);
}

const RESET_NUM = 5040;

require "get_data.php";
require "skeleton.php";

$filename = $argv[1];
$tmp_filename = $filename . ".tmp";

// TODO: print out date/time
// TODO: print out weather forecast: 30 minutely / hourly precip/temp/etc
// TODO: don't print out table if no trains

?>

<?php

function getPageContents($iteration): string {
  ob_start();
  headBody();
  printAllDataSync($iteration);
  endBody();
  $contents = ob_get_contents();
  return $contents;
}
?>

<?php
  $i = 0;
  while (true) {
    $contents = getPageContents($i);
    $file = fopen($filename, "w");
    fwrite($file, $contents);
    sleep(60);
    $i++;
  }
?>
