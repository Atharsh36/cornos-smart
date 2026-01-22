// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleVault {
    mapping(address => uint256) public balances;
    address public owner;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Allow contract to receive CRO
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function deposit() external payable {
        require(msg.value > 0, "Must send CRO");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
    
    function getTotalBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

contract SimpleEscrow {
    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        bool completed;
        bool disputed;
    }
    
    mapping(bytes32 => Order) public orders;
    address public owner;
    
    event OrderCreated(bytes32 indexed orderId, address buyer, address seller, uint256 amount);
    event OrderCompleted(bytes32 indexed orderId);
    event OrderDisputed(bytes32 indexed orderId);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createOrder(bytes32 orderId, address seller) external payable {
        require(msg.value > 0, "Must send CRO");
        require(orders[orderId].buyer == address(0), "Order already exists");
        
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            completed: false,
            disputed: false
        });
        
        emit OrderCreated(orderId, msg.sender, seller, msg.value);
    }
    
    function completeOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "Only buyer can complete");
        require(!order.completed, "Already completed");
        require(!order.disputed, "Order disputed");
        
        order.completed = true;
        payable(order.seller).transfer(order.amount);
        
        emit OrderCompleted(orderId);
    }
    
    function disputeOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender || order.seller == msg.sender, "Not authorized");
        require(!order.completed, "Already completed");
        
        order.disputed = true;
        emit OrderDisputed(orderId);
    }
}