<?php

	require 'lib/Instagram.php';
	require 'lib/MailChimp.php';
	use \DrewM\MailChimp\MailChimp;
	use MetzWeb\Instagram\Instagram;
	ini_set('display_errors', 'On');
	$code = $_GET['code'];
	$email = $_GET['email'];



	$MailChimp = new MailChimp('98a800380d6739abab36ddfd9ad87ada-us12');
	$list_id = 'a4e699e573';



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
		$userID=$data->user->id;
		$serial=rawurlencode ( json_encode($data));
		//var_dump(serialize($data));
		//echo $serial;
		$result = $MailChimp->post("lists/$list_id/members", [
			'email_address' => urldecode($email),
			'status'        => 'subscribed',
			'merge_fields' 	=> ['IGRAM'=>$data->user->username]
		]);

		header('Location: http://trysherpa.com/#/post-signup/'.$token.'/'.rawurlencode($email).'/'.$serial);
	} else {
	    // check whether an error occurred
	    if (isset($_GET['error'])) {
	        echo 'An error occurred: ' . $_GET['error_description'];
	    }
	}
?>