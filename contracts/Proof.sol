pragma solidity^0.5.0;

contract Proof {

    struct Data {
        string key;
        string store;
        bool exists;
        uint lastUpdated;
    }

    mapping(string => Data) proofs;

    function set(string memory key, string memory store) public {
        proofs[key] = Data(key, store, true, block.timestamp);
    }

    function get(string memory key) public view returns (string memory store) {
        return proofs[key].store;
    }

    function remove(string memory key) public returns (bool success) {
        if(proofs[key].exists) {
            delete proofs[key];
            return true;
        } else {
            return false;
        }
    }

    function exists(string memory key) public view returns (bool success) {
        if(proofs[key].exists) {
            return true;
        } else {
            return false;
        }
    }

    function timestamp(string memory key) public view returns (uint lastUpdated) {
            return proofs[key].lastUpdated;
    }


}
