<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$respond = static function (int $code, array $payload): void {
    http_response_code($code);
    echo json_encode($payload);
    exit;
};

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $respond(405, ['success' => false, 'error' => 'Method not allowed']);
}

$payload = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

if (stripos($contentType, 'application/json') !== false) {
    $rawInput = file_get_contents('php://input');
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $payload = $decoded;
    }
} else {
    $payload = $_POST;
}

$clean = static function ($value): string {
    $value = (string) $value;
    $value = strip_tags($value);
    $value = preg_replace('/[\r\n]+/', ' ', $value);
    return trim($value);
};

$name = $clean($payload['name'] ?? '');
$email = $clean($payload['email'] ?? '');
$subject = $clean($payload['subject'] ?? '');
$message = trim((string) ($payload['message'] ?? ''));
$website = $clean($payload['_honey'] ?? $payload['website'] ?? '');

if ($website !== '') {
    $respond(200, ['success' => true]);
}

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    $respond(400, ['success' => false, 'error' => 'All fields are required']);
}

if (strlen($name) < 2 || strlen($subject) < 3 || strlen($message) < 10) {
    $respond(400, ['success' => false, 'error' => 'Message is too short']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $respond(400, ['success' => false, 'error' => 'Invalid email address']);
}

if (strlen($message) > 4000) {
    $respond(400, ['success' => false, 'error' => 'Message is too long']);
}

$recipients = ['seppe.vanroy@telenet.be', 'svsolutions.support@gmail.com'];
$recipient = implode(', ', $recipients);
$mailSubject = 'Portfolio contact: ' . $subject;
$mailBody = "New message from the portfolio contact form\n\n";
$mailBody .= "Name: {$name}\n";
$mailBody .= "Email: {$email}\n";
$mailBody .= "Subject: {$subject}\n";
$mailBody .= "To: {$recipient}\n";
$mailBody .= "Sent: " . date('c') . "\n\n";
$mailBody .= "Message:\n{$message}\n";

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$host = preg_replace('/:\\d+$/', '', $host);
$fromAddress = getenv('CONTACT_FROM') ?: ('portfolio@' . $host);
if (!filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
    $fromAddress = $recipients[0];
}

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Seppe Portfolio <' . $fromAddress . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
];

$sendWithSmtp = static function (array $recipients, string $subject, string $body, array $headers, string $from) use ($respond): bool {
    $smtpHost = getenv('SMTP_HOST') ?: '';
    $smtpUser = getenv('SMTP_USER') ?: '';
    $smtpPass = getenv('SMTP_PASS') ?: '';
    $smtpPort = (int) (getenv('SMTP_PORT') ?: 587);
    $smtpSecure = strtolower((string) (getenv('SMTP_SECURE') ?: 'tls'));

    if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
        return false;
    }

    $transport = $smtpSecure === 'ssl' ? 'ssl://' . $smtpHost : $smtpHost;
    $socket = @fsockopen($transport, $smtpPort, $errno, $errstr, 20);
    if (!$socket) {
        $respond(500, ['success' => false, 'error' => 'Could not connect to SMTP server.']);
    }

    stream_set_timeout($socket, 20);

    $read = static function () use ($socket): string {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    };

    $command = static function (string $command, array $expected) use ($socket, $read, $respond): string {
        fwrite($socket, $command . "\r\n");
        $response = $read();
        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expected, true)) {
            fclose($socket);
            $respond(500, ['success' => false, 'error' => 'SMTP server rejected the message.']);
        }
        return $response;
    };

    $greeting = $read();
    if ((int) substr($greeting, 0, 3) !== 220) {
        fclose($socket);
        $respond(500, ['success' => false, 'error' => 'SMTP server did not accept the connection.']);
    }

    $serverName = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $command('EHLO ' . $serverName, [250]);

    if ($smtpSecure === 'tls') {
        $command('STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            $respond(500, ['success' => false, 'error' => 'Could not start SMTP encryption.']);
        }
        $command('EHLO ' . $serverName, [250]);
    }

    $command('AUTH LOGIN', [334]);
    $command(base64_encode($smtpUser), [334]);
    $command(base64_encode($smtpPass), [235]);
    $command('MAIL FROM:<' . $from . '>', [250]);
    foreach ($recipients as $to) {
        $command('RCPT TO:<' . $to . '>', [250, 251]);
    }
    $command('DATA', [354]);

    $message = implode("\r\n", $headers)
        . "\r\nSubject: " . $subject
        . "\r\nTo: " . implode(', ', $recipients)
        . "\r\n\r\n"
        . $body;
    $message = preg_replace('/^\./m', '..', $message);

    $command($message . "\r\n.", [250]);
    $command('QUIT', [221]);
    fclose($socket);

    return true;
};

$success = $sendWithSmtp($recipients, $mailSubject, $mailBody, $headers, $fromAddress);

if (!$success) {
    $additionalParams = '';
    if (PHP_OS_FAMILY !== 'Windows' && filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
        $additionalParams = '-f' . $fromAddress;
    }

    $success = $additionalParams !== ''
        ? @mail($recipient, $mailSubject, $mailBody, implode("\r\n", $headers), $additionalParams)
        : @mail($recipient, $mailSubject, $mailBody, implode("\r\n", $headers));
}

if (!$success) {
    $respond(500, [
        'success' => false,
        'error' => 'Mail delivery is not configured on this server.',
        'fallback' => 'mailto:' . $recipient . '?subject=' . rawurlencode($mailSubject) . '&body=' . rawurlencode($mailBody)
    ]);
}

$respond(200, ['success' => true]);
