# Orb CSV Ingestion Script

This project reads a CSV file of usage events and sends them to the Orb ingestion API.

## Setup

Prerequisites: Have Node version 18 or later installed on your local machine. If you have an earlier version of Node you will need to install node-fetch. `npm install node-fetch`

1. Install dependencies:
   `npm install`

2. Create a `.env` file at the top level of your project. Get your API key from your ORB account and paste it where the below sample says
   YOUR_API_KEY_GOES_HERE. Make sure the .env file is in the `.gitignore` (it should already be there if you cloned this repo) so you don't have your API key publicly hosted onto Github.

   `ORB_API_KEY=YOUR_API_KEY_GOES_HERE`

3. Verify CSV file: Ensure that `usage_events.csv` is present in the project root. This file should already be included in the repo after cloning.
4. Run `node index.js` in the terminal to run the script.

## Troubleshooting

1.  Event timestamp must be later than grace period.
    During the process of writing this script I came across an error that said the following: "Event timestamp 2023-02-01T00:00:00+00:00 must be later than 2025-08-28T07:53:28.707190+00:00 based on account grace period"

    While troubleshooting I found out that Orb only accepts dates within a grace period of 12 hours from the current time. The CSV file provided has dates from 2023. To avoid this error the script automatically sets the timestamp to today with this line of code.

    `timestamp: new Date().toISOString()`

2.  "None is not of type 'number', 'string', 'boolean'"

    I also came across this error while writing the script. This was happening because the columns `standard` and `sameday` had some blank fields, and the Orb API would not accept a null value. To fix this error I had a fallback of 0 if standard or sameday did not have a value demonstrated by these lines of code. This will guarantee that Orb will always receive a valid number.

    `standard: parseNumber(record.standard) ?? 0,`
    ` sameday: parseNumber(record.sameday) ?? 0,`
