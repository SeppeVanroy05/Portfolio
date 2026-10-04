<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

$message = isset($payload['message']) ? trim((string) $payload['message']) : '';
$lang = isset($payload['lang']) ? strtolower((string) $payload['lang']) : 'en';
$history = isset($payload['history']) && is_array($payload['history']) ? $payload['history'] : [];

if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

$apiKey = getenv('OPENAI_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Server is missing OPENAI_API_KEY']);
    exit;
}

$systemPrompt = $lang === 'nl'
    ? 'Je bent de portfolio-assistent van Seppe. Antwoord kort, vriendelijk en nuttig in het Nederlands. Focus op projecten, skills, studie, ervaring en contact. Als iets onbekend is, zeg dat eerlijk en geef een bruikbaar alternatief.'
    : 'You are Seppe\'s portfolio assistant. Reply briefly, friendly, and useful in English. Focus on projects, skills, studies, experience, and contact. If something is unknown, say so honestly and offer a practical alternative.';

$portfolioContext = $lang === 'nl'
    ? ' Seppe studeert Application Development, bouwt graag applicaties met React, .NET en C# en is volop aan het leren. Hij werkt graag zelfstandig, neemt initiatief en zet door. Hij runt SV-Solutions en maakt daarmee websites voor bedrijven. Met een team bouwt hij Skolio, een platform voor communicatie tussen ouders en scholen. Zijn andere projecten zijn MissionZebra, K.V.V. Rauw, Poutrel, Aurubis en zijn portfolio. Zijn ervaring bij Aurubis omvat software voor screen blanking van tablets in voertuigen. Hij zoekt een stageplek waar hij veel kan leren en aan echte applicaties kan meewerken. Contact: seppe.vanroy@telenet.be. Verzin geen stack, projectstatus of bijdragen die niet zijn vermeld.'
    : ' Seppe studies Application Development, enjoys building applications with React, .NET and C# and is still learning. He works independently, takes initiative and perseveres. He runs SV-Solutions, building websites for companies. With a team he is building Skolio, a platform for communication between parents and schools. His other projects are MissionZebra, K.V.V. Rauw, Poutrel, Aurubis and his portfolio. His Aurubis experience includes screen blanking software for tablets in vehicles. He is looking for an internship to learn and contribute to real applications. Contact: seppe.vanroy@telenet.be. Do not invent stacks, project status or contributions that are not stated.';
$systemPrompt .= $portfolioContext;

$inputMessages = [
    [
        'role' => 'system',
        'content' => [
            [
                'type' => 'input_text',
                'text' => $systemPrompt,
            ],
        ],
    ],
];

foreach ($history as $item) {
    if (!is_array($item)) {
        continue;
    }

    $role = isset($item['role']) ? (string) $item['role'] : '';
    $content = isset($item['content']) ? trim((string) $item['content']) : '';

    if (($role !== 'user' && $role !== 'assistant') || $content === '') {
        continue;
    }

    $inputMessages[] = [
        'role' => $role,
        'content' => [
            [
                'type' => 'input_text',
                'text' => $content,
            ],
        ],
    ];
}

$inputMessages[] = [
    'role' => 'user',
    'content' => [
        [
            'type' => 'input_text',
            'text' => $message,
        ],
    ],
];

$requestBody = [
    'model' => 'gpt-4o-mini',
    'input' => $inputMessages,
    'max_output_tokens' => 260,
    'temperature' => 0.6,
];

$ch = curl_init('https://api.openai.com/v1/responses');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 25);

$apiResponse = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($apiResponse === false || $curlError) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to reach OpenAI API']);
    exit;
}

$decoded = json_decode($apiResponse, true);

if (!is_array($decoded) || $httpCode >= 400) {
    http_response_code(502);
    echo json_encode(['error' => 'OpenAI API returned an error']);
    exit;
}

$reply = '';

if (isset($decoded['output_text']) && is_string($decoded['output_text'])) {
    $reply = trim($decoded['output_text']);
}

if ($reply === '' && isset($decoded['output']) && is_array($decoded['output'])) {
    foreach ($decoded['output'] as $outputItem) {
        if (!is_array($outputItem) || !isset($outputItem['content']) || !is_array($outputItem['content'])) {
            continue;
        }

        foreach ($outputItem['content'] as $contentItem) {
            if (is_array($contentItem) && isset($contentItem['text']) && is_string($contentItem['text'])) {
                $reply = trim($contentItem['text']);
                if ($reply !== '') {
                    break 2;
                }
            }
        }
    }
}

if ($reply === '') {
    $reply = $lang === 'nl'
        ? 'Ik kon nu geen volledig antwoord genereren. Probeer het opnieuw met een iets concretere vraag.'
        : 'I could not generate a full answer right now. Please try again with a more specific question.';
}

echo json_encode(['reply' => $reply]);
