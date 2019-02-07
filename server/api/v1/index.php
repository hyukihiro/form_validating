<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Max-Age: 3600');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Content-Type: application/json');

$zip_code = '';

function init() {
    if (isset($_GET['zipcode'])) {
        $zip_code = $_GET['zipcode'];
        $data = 'http://zipcloud.ibsnet.co.jp/api/search?zipcode=' . $zip_code;
        $json = file_get_contents($data);
        echo $json;
    } else {
        echo json_encode(array(
            'error' => 'error',
            'message' => 'query must be required.'
        ));
    }
}

init();
?>