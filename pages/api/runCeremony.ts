import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extract the form data from the request
  const formData = req.body;

  // Define the path to the inputs folder
  const inputsFolderPath = path.join(process.cwd(), 'inputs'); // Adjust as needed

  // Check if the inputs directory exists, if not create it
  if (!fs.existsSync(inputsFolderPath)) {
    fs.mkdirSync(inputsFolderPath, { recursive: true });
  }

  // Save the input JSON in the 'inputs' folder
  const inputJsonPath = path.join(inputsFolderPath, 'input.json'); // Adjust as needed
  fs.writeFileSync(inputJsonPath, JSON.stringify(formData));

  console.log('Ceremony process started');

  try {
    // // Update the path to the script according to its new location
    // // Example: if 'ceremony.sh' is placed directly in the root directory
    // const scriptPath = path.join(process.cwd(), 'ceremony.sh');

    // console.log('Executing ceremony script...');
    // await execAsync(`bash ${scriptPath}`);
    // console.log('Ceremony script executed successfully');

    
    // Handle reading of keys or other output data
    const keysPath = path.join('ceremony', 'circuit.zkey'); // Adjust the path as needed
    const keys = fs.readFileSync(keysPath, 'utf8');

    res.status(200).json({
      message: 'Ceremony completed successfully',
      keys: keys
    });
  } catch (error) {
    console.error(`Error during ceremony process: ${error}`);
    res.status(500).send('Error running the ceremony');
  }
}
