// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title BuyEarthProxy
 * @dev 这是一个简单的ERC1967代理合约，用于UUPS升级模式
 * 在UUPS模式中，升级逻辑位于实现合约中，代理本身非常简单
 */
contract BuyEarthProxy is ERC1967Proxy {
    /**
     * @dev 构造函数
     * @param _logic 初始实现合约地址
     * @param _data 初始化调用数据，通常是实现合约的initialize()函数调用
     */
    constructor(
        address _logic,
        bytes memory _data
    ) ERC1967Proxy(_logic, _data) {}

    /**
     * @dev 允许合约接收ETH
     */
    receive() external payable {}
}
