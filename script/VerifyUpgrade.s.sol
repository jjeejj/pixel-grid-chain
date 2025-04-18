// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

// 关键存储槽位
bytes32 constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
bytes32 constant ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

/**
 * @title VerifyUpgradeScript
 * @dev 验证代理合约的升级状态
 */
contract VerifyUpgradeScript is Script {
    function run() public view {
        // 您的代理合约地址
        address proxyAddress = 0x68B1D87F95878fE05B998F19b66F4baba5De1aed;
        // 期望的实现合约地址 (可选)
        address expectedImplementation = address(0x3Aa5ebB10DC797CAC828524e59A333d0A371443c); // 如果需要验证特定地址，请更改此值
        
        console.log("======== Proxy Information ========");
        console.log("Proxy address:", proxyAddress);
        
        // 读取实现地址
        bytes32 implSlotValue = vm.load(proxyAddress, IMPLEMENTATION_SLOT);
        address currentImpl = address(uint160(uint256(implSlotValue)));
        
        console.log("Current implementation:", currentImpl);
        
        if (expectedImplementation != address(0)) {
            if (currentImpl == expectedImplementation) {
                console.log("[OK] Implementation matches expected address");
            } else {
                console.log("[ERROR] Implementation DOES NOT match expected address");
                console.log("  Expected:", expectedImplementation);
                console.log("  Actual:", currentImpl);
            }
        }
        
        // 检查代码大小以确认是否有代码
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(currentImpl)
        }
        
        if (codeSize > 0) {
            console.log("[OK] Implementation has code (size:", codeSize, "bytes)");
        } else {
            console.log("[ERROR] WARNING: Implementation has NO CODE!");
        }
        
        // 读取管理员地址 (对于TransparentUpgradeableProxy)
        bytes32 adminSlotValue = vm.load(proxyAddress, ADMIN_SLOT);
        address admin = address(uint160(uint256(adminSlotValue)));
        
        if (admin != address(0)) {
            console.log("Admin address:", admin);
        } else {
            console.log("No admin found (this is normal for UUPS proxies)");
        }
        
        // 尝试判断代理类型
        if (admin != address(0)) {
            console.log("Proxy type: Likely TransparentUpgradeableProxy");
        } else {
            console.log("Proxy type: Likely UUPS or custom proxy");
        }
        
        console.log("==================================");
    }
} 