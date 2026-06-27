<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Collect form data securely
    $name = htmlspecialchars($_POST['name']);
    $user_email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $company = htmlspecialchars($_POST['company']);

    // 2. Setup email details
    $to = $user_email; 
    $subject = "Thanks for joining with us!";
    
    // 3. Create the email content
    $message = "Hi " . $name . ",\n\n";
    if(!empty($company)) {
        $message .= "Thank you for registering your company, " . $company . ".\n";
    }
    $message .= "We have successfully received your details. We will get back to you shortly.\n\n";
    $message .= "Best regards,\nYour Website Team";

    // 4. Setup email headers
    $headers = "From: jeetwebsite2026@gmail.com\r\n";
    $headers .= "Reply-To: jeetwebsite2026@gmail.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // 5. Send the email
    if (mail($to, $subject, $message, $headers)) {
        echo "<h1>Success! Thank you for joining us.</h1>";
    } else {
        echo "<h1>Error: Could not send email.</h1>";
    }
} else {
    echo "Invalid Request";
}
?>
