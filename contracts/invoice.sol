pragma solidity^0.5.0;

contract InvoiceDB {
    struct Invoice {
        string id;
        string hash;
        bool exists;
        uint updates;
        bool modified;
        uint256 lastUpdated;

    }

    mapping(string => Invoice) invoiceMap;

    function create(string memory _invoiceId, string memory _hash) public {
        invoiceMap[_invoiceId] = Invoice(_invoiceId, _hash, true, 0, false, block.timestamp);
    }

    function getTimestamp(string memory _invoiceId) public view returns (uint256  _timestamp) {
        return invoiceMap[_invoiceId].lastUpdated;
    }

    function getHash(string memory _invoiceId) public view returns (string memory _hash) {
        return invoiceMap[_invoiceId].hash;
    }

    function updated(string memory _invoiceId) public view returns (uint updates) {
        return invoiceMap[_invoiceId].updates;
    }

    function modified(string memory _invoiceId) public view returns (bool success) {
        if(invoiceMap[_invoiceId].modified) {
            return (true);
        } else {
            return (false);
        }
    }

    function markModified(string memory _invoiceId) public returns (bool success) {
        if(invoiceMap[_invoiceId].exists) {
            invoiceMap[_invoiceId].modified = true;
            return (true);
        } else {
            return (false);
        }
    }

    function update(string memory _invoiceId, string memory _hash) public returns (bool success) {
        if(invoiceMap[_invoiceId].exists) {
            uint _updates = invoiceMap[_invoiceId].updates + 1;
            invoiceMap[_invoiceId] = Invoice(_invoiceId, _hash, true, _updates, false, block.timestamp);
            return (true);
        } else {
            return (false);
        }
    }

    function exists(string memory _invoiceId) public returns (bool success) {
        if(invoiceMap[_invoiceId].exists) {
            return (true);
        } else {
            return (false);
        }
    }

    function remove(string memory _invoiceId) public returns (bool success) {
        if(invoiceMap[_invoiceId].exists) {
            delete invoiceMap[_invoiceId];
            return (true);
        } else {
            return (false);
        }
    }

}
