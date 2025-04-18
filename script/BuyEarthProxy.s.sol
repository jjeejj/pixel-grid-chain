// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BuyEarthProxy.sol";
import "../src/BuyEarth.sol"; // Import BuyEarth to get the initialize function signature

contract BuyEarthProxyScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");

        address buyEarthLogicAddress = 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707;

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the proxy, passing logic address, init data, and initial owner (deployer)
        BuyEarthProxy buyEarthProxy = new BuyEarthProxy(
            buyEarthLogicAddress,
            vm.addr(deployerPrivateKey),
            abi.encodeWithSignature("initialize()") // 调用初始化函数
        );

        console.log("BuyEarthProxy deployed at:", address(buyEarthProxy));

        vm.stopBroadcast();
    }
}
