<?php
$url = 'https://build.particle.io/libs.json';
$file = 'libs.json';
$cache_time = 900;

$last_ts = filemtime($file);

if($last_ts<time()-$cache_time)
	file_put_contents($file, file_get_contents($url));

header('Content-type: application/json');
echo file_get_contents($file);
?>
