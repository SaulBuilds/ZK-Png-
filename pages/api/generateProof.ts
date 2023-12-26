// pages/api/generateProof.js
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { fflonk } from 'snarkjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const formData = req.body;
    const inputsFolderPath = path.join(process.cwd(), 'inputs');

    if (!fs.existsSync(inputsFolderPath)) {
        fs.mkdirSync(inputsFolderPath, { recursive: true });
    }

    const inputJsonPath = path.join(inputsFolderPath, 'input.json');
    fs.writeFileSync(inputJsonPath, JSON.stringify(formData));

    try {
        // Ensure the verification key file exists
        const verificationKeyPath = path.join(process.cwd(),"ceremony", "verification_key.json");
        if (!fs.existsSync(verificationKeyPath)) {
            throw new Error("Verification key file not found");
        }
        const vKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));

        // Generate and verify the proof
        const { proof, publicSignals } = await fflonk.fullProve(formData, "ceremony/circuit.wasm", "ceremony/circuit.zkey");
        const verified = await fflonk.verify(vKey, publicSignals, proof);

        res.status(200).json({ proof, verified });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating proof');
    }
}
