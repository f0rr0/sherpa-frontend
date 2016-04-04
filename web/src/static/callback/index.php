<?php

	require 'lib/Instagram.php';
	use MetzWeb\Instagram\Instagram;
	ini_set('display_errors', 'On');
	$code = $_GET['code'];

	$email = $_GET['email'];


	// initialize class
	$instagram = new Instagram(array(
	    'apiKey' => '6c93234fa3544a6592b382a0a814e555',
	    'apiSecret' => 'afac24bc39eb4ab2bb52adf09c068293',
	    'apiCallback' => 'http://trysherpa.com/callback/?email='.$email // must point to success.php
	));


	if (isset($code)) {
	    // receive OAuth token object
	    $data = $instagram->getOAuthToken($code);
	    $token = $data->access_token;
	    //var_dump($data);
		header('Location: http://trysherpa.com/#/post-signup/'.$token.'/'.urlencode($email));
	} else {
	    // check whether an error occurred
	    if (isset($_GET['error'])) {
	        echo 'An error occurred: ' . $_GET['error_description'];
	    }
	}


?>