// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEscrow {
    function fundOrder(
        bytes32 orderId,
        address buyer,
        address seller,
        address token,
        uint256 amount
    ) external payable;
}

contract Vault is ReentrancyGuard {
    address public escrow;

    // user => token => balance
    mapping(address => mapping(address => uint256)) public tokenBalances;
    // user => CRO balance
    mapping(address => uint256) public nativeBalances;

    event DepositNative(address indexed user, uint256 amount);
    event DepositToken(address indexed user, address indexed token, uint256 amount);
    event WithdrawNative(address indexed user, uint256 amount);
    event WithdrawToken(address indexed user, address indexed token, uint256 amount);
    event PaidToEscrow(bytes32 indexed orderId, address indexed buyer, address indexed seller, address token, uint256 amount);

    constructor(address _escrow) {
        escrow = _escrow;
    }

    function depositNative() external payable {
        require(msg.value > 0, "No CRO");
        nativeBalances[msg.sender] += msg.value;
        emit DepositNative(msg.sender, msg.value);
    }

    function depositToken(address token, uint256 amount) external {
        require(amount > 0, "amount 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][token] += amount;
        emit DepositToken(msg.sender, token, amount);
    }

    function withdrawNative(uint256 amount) external nonReentrant {
        require(nativeBalances[msg.sender] >= amount, "low CRO");
        nativeBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit WithdrawNative(msg.sender, amount);
    }

    function withdrawToken(address token, uint256 amount) external nonReentrant {
        require(tokenBalances[msg.sender][token] >= amount, "low token");
        tokenBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit WithdrawToken(msg.sender, token, amount);
    }

    // x402-like: programmatic payment triggers escrow funding
    function payToEscrowWithNative(bytes32 orderId, address seller, uint256 amount) external nonReentrant {
        require(nativeBalances[msg.sender] >= amount, "low CRO");
        nativeBalances[msg.sender] -= amount;

        IEscrow(escrow).fundOrder{value: amount}(orderId, msg.sender, seller, address(0), amount);

        emit PaidToEscrow(orderId, msg.sender, seller, address(0), amount);
    }

    function payToEscrowWithToken(bytes32 orderId, address token, address seller, uint256 amount) external nonReentrant {
        require(tokenBalances[msg.sender][token] >= amount, "low token");
        tokenBalances[msg.sender][token] -= amount;

        // Send token to escrow contract
        IERC20(token).transfer(escrow, amount);

        // record the order in escrow
        IEscrow(escrow).fundOrder(orderId, msg.sender, seller, token, amount);

        emit PaidToEscrow(orderId, msg.sender, seller, token, amount);
    }
}
