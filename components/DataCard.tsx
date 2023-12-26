// zkpinz/components/DataCard.tsx
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useGenerateInputJson from '../hooks/useGenerateInputJson';

interface FormData {
  name: string;
  address: string;
  phoneNumber: string;
}

export function DataCard() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    phoneNumber: ""
  });

  const [proofData, setProofData] = useState(null); // State to store proof data
  const generateInputJson = useGenerateInputJson();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputJsonData = generateInputJson(formData);

    try {
      // First, create the input file
      await fetch('/api/runCeremony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputJsonData),
      });

      // Then, generate and verify the proof
      const proofResponse = await fetch('/api/generateProof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputJsonData),
      });

      if (proofResponse.ok) {
        const proofResult = await proofResponse.json();
        setProofData(proofResult); // Store proof data in state
      } else {
        throw new Error('Failed to generate proof');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md m-4">
      <CardContent className="p-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input className="w-full" placeholder="Enter your name" name="name" type="text" onChange={handleChange} />
          <Input className="w-full" placeholder="Enter your address" name="address" type="text" onChange={handleChange} />
          <Input className="w-full" placeholder="Enter your phone number" name="phoneNumber" type="text" onChange={handleChange} />
          <Button className="w-full" type="submit">Start Ceremony of Tau</Button>
        </form>
        {proofData && (
          <div>
            <h3>Proof Result:</h3>
            <pre>{JSON.stringify(proofData, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
