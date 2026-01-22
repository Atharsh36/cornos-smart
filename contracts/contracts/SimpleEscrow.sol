// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleEscrow {
    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        bool completed;
        bool refunded;
        uint256 createdAt;
    }
    
    mapping(bytes32 => Order) public orders;
    address public owner;
    
    event OrderCreated(bytes32 indexed orderId, address buyer, address seller, uint256 amount);
    event OrderCompleted(bytes32 indexed orderId);
    event OrderRefunded(bytes32 indexed orderId);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Receive CRO and create order
    receive() external payable {
        require(msg.value > 0, "Must send CRO");
        
        // Generate order ID from transaction data
        bytes32 orderId = keccak256(abi.encodePacked(msg.sender, block.timestamp, msg.value));
        
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: address(0), // Will be set later
            amount: msg.value,
            completed: false,
            refunded: false,
            createdAt: block.timestamp
        });
        
        emit OrderCreated(orderId, msg.sender, address(0), msg.value);
    }
    
    function createOrder(bytes32 orderId, address seller) external payable {
        require(msg.value > 0, "Must send CRO");
        require(orders[orderId].buyer == address(0), "Order already exists");
        
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            completed: false,
            refunded: false,
            createdAt: block.timestamp
        });
        
        emit OrderCreated(orderId, msg.sender, seller, msg.value);
    }
    
    function completeOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "Only buyer can complete");
        require(!order.completed && !order.refunded, "Order already processed");
        require(order.seller != address(0), "Seller not set");
        
        order.completed = true;
        payable(order.seller).transfer(order.amount);
        
        emit OrderCompleted(orderId);
    }
    
    function refundOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender || msg.sender == owner, "Not authorized");
        require(!order.completed && !order.refunded, "Order already processed");
        
        order.refunded = true;
        payable(order.buyer).transfer(order.amount);
        
        emit OrderRefunded(orderId);
    }
    
    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}