// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow is Ownable, ReentrancyGuard {
    enum Status { NONE, FUNDED, SHIPPED, DELIVERED, COMPLETED, DISPUTED, REFUNDED }

    struct Order {
        address buyer;
        address seller;
        address token; // address(0) = CRO
        uint256 amount;
        Status status;
        uint256 createdAt;
    }

    mapping(bytes32 => Order) public orders;

    event OrderFunded(bytes32 indexed orderId, address indexed buyer, address indexed seller, address token, uint256 amount);
    event Shipped(bytes32 indexed orderId);
    event Delivered(bytes32 indexed orderId);
    event Completed(bytes32 indexed orderId);
    event Disputed(bytes32 indexed orderId);
    event Refunded(bytes32 indexed orderId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // For token orders, tokens must already be in escrow before calling this
    function fundOrder(
        bytes32 orderId,
        address buyer,
        address seller,
        address token,
        uint256 amount
    ) external payable nonReentrant {
        require(orders[orderId].status == Status.NONE, "Order exists");
        require(amount > 0, "Invalid amount");

        if (token == address(0)) {
            require(msg.value == amount, "CRO amount mismatch");
        } else {
            require(msg.value == 0, "No CRO for token order");
            // Token amount must already be transferred to escrow before fundOrder is called
        }

        orders[orderId] = Order(buyer, seller, token, amount, Status.FUNDED, block.timestamp);

        emit OrderFunded(orderId, buyer, seller, token, amount);
    }

    function markShipped(bytes32 orderId) external {
        Order storage o = orders[orderId];
        require(o.status == Status.FUNDED, "Not funded");
        require(msg.sender == o.seller, "Only seller");
        o.status = Status.SHIPPED;
        emit Shipped(orderId);
    }

    function confirmDelivery(bytes32 orderId) external nonReentrant {
        Order storage o = orders[orderId];
        require(o.status == Status.SHIPPED, "Not shipped");
        require(msg.sender == o.buyer, "Only buyer");

        o.status = Status.DELIVERED;
        emit Delivered(orderId);

        _releaseToSeller(orderId);
    }

    function raiseDispute(bytes32 orderId) external {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Only buyer");
        require(o.status == Status.FUNDED || o.status == Status.SHIPPED, "Cannot dispute");
        o.status = Status.DISPUTED;
        emit Disputed(orderId);
    }

    function resolveDispute(bytes32 orderId, bool refundBuyer) external onlyOwner nonReentrant {
        Order storage o = orders[orderId];
        require(o.status == Status.DISPUTED, "Not disputed");

        if (refundBuyer) {
            o.status = Status.REFUNDED;
            _refundBuyer(orderId);
            emit Refunded(orderId);
        } else {
            _releaseToSeller(orderId);
        }
    }

    function _releaseToSeller(bytes32 orderId) internal {
        Order storage o = orders[orderId];
        require(o.status != Status.COMPLETED, "Already completed");

        o.status = Status.COMPLETED;

        if (o.token == address(0)) {
            payable(o.seller).transfer(o.amount);
        } else {
            IERC20(o.token).transfer(o.seller, o.amount);
        }

        emit Completed(orderId);
    }

    function _refundBuyer(bytes32 orderId) internal {
        Order storage o = orders[orderId];

        if (o.token == address(0)) {
            payable(o.buyer).transfer(o.amount);
        } else {
            IERC20(o.token).transfer(o.buyer, o.amount);
        }
    }
}
