#!/bin/bash

# Enable or disable debug messages (1 for enable, 0 for disable)
debug_mode=1

# Function to display debug messages
debug_log() {
  if [ "$debug_mode" -eq 1 ]; then
    echo "Debug: $@"
  fi
}

debug_log "Starting script..."

# Define the input JSON file path
input_json="../inputs/input.json" # Adjust the path as needed

# Create and move into a new directory for the ceremony
debug_log "Creating a new directory for the ceremony..."
mkdir -p ceremony
cd ceremony

# Start a new powers of tau ceremony (Example with bn128 curve and power 14)
debug_log "Starting a new powers of tau ceremony with bn128 curve and power 14..."
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v

# Contribute to the ceremony with random entropy
debug_log "Contributing to the ceremony with random entropy..."
RANDOM_ENTROPY=$(openssl rand -hex 32)
echo $RANDOM_ENTROPY | snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v

# Apply a random beacon
debug_log "Applying a random beacon..."
snarkjs powersoftau beacon pot14_0001.ptau pot14_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"

# Prepare phase 2
debug_log "Preparing phase 2..."
snarkjs powersoftau prepare phase2 pot14_beacon.ptau pot14_final.ptau -v

# Verify the final ptau
debug_log "Verifying the final ptau..."
snarkjs powersoftau verify pot14_final.ptau

# Compile the circuit
debug_log "Compiling the circuit..."
circom circuit.circom --r1cs --wasm --sym
cd ceremony
debug_log "Exporting r1cs to json..."
snarkjs r1cs export json circuit.r1cs circuit.r1cs.json

debug_log "Generating witness using the input JSON..."
node generate_witness.js circuit.wasm inputs/input.json witness.wtns

debug_log "Setting up snarkjs fflonk..."
snarkjs fflonk setup circuit.r1cs pot14_final.ptau circuit.zkey

debug_log "Proving with fflonk..."
snarkjs fflonk prove circuit.zkey witness.wtns proof.json public.json

debug_log "Verifying proof with fflonk..."
snarkjs fflonk verify verification_key.json public.json proof.json

debug_log "Exporting solidity verifier..."
snarkjs zkey export solidityverifier circuit.zkey verifier.sol

debug_log "Script completed."