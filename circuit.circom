// zkpinz/circuits/myCircuit.circom

pragma circom 2.0.0;

template FormDataProof() {
    signal input nameHash;
    signal input addressHash;
    signal input phoneNumberHash;

    signal output valid;

    
    signal input expectedNameHash;
    signal input expectedAddressHash;
    signal input expectedPhoneNumberHash;

    // Constraint to ensure the hashes are correct
    valid <== (nameHash - expectedNameHash) + (addressHash - expectedAddressHash) + (phoneNumberHash - expectedPhoneNumberHash);
}

component main = FormDataProof();