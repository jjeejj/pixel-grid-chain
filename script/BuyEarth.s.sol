// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BuyEarth.sol";

// 这是单独部署逻辑合约的
contract BuyEarthScript is Script {
    function setUp() public {}

    function run() public {
        console.log("Start deploy BuyEarth Contract");
        uint256 deployerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        BuyEarth buyEarth = new BuyEarth();
        console.log("BuyEarth deployed at:", address(buyEarth));

        vm.stopBroadcast();
    }
}