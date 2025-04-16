// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BuyEarth.sol";

contract BuyEarthScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PT_ACCOUNT_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        BuyEarth buyEarth = new BuyEarth();
        console.log("BuyEarth deployed at:", address(buyEarth));

        vm.stopBroadcast();
    }
}