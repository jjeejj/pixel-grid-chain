// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BuyEarth.sol";
import "../src/BuyEarthProxy.sol";

/**
 * @title BuyEarthProxyUUPSScript
 * @dev Script to deploy a UUPS upgradeable contract pattern
 * 这个是第一次部署的使用的，会同时部署逻辑合约和代理合约
 */
contract BuyEarthProxyUUPSScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy implementation contract
        BuyEarth implementation = new BuyEarth();
        console.log("Implementation contract deployed at:", address(implementation));
        
        // 2. Prepare initialization data for the proxy
        // This will call initialize() on the implementation through the proxy
        bytes memory initData = abi.encodeWithSelector(
            BuyEarth.initialize.selector
        );
        
        // 3. Deploy ERC1967 proxy pointing to the implementation
        BuyEarthProxy proxy = new BuyEarthProxy(
            address(implementation),
            initData
        );
        console.log("Proxy contract deployed at:", address(proxy));
        
        // 4. Create an interface to check the owner
        BuyEarth earthProxy = BuyEarth(address(proxy));
        address owner = earthProxy.owner();
        console.log("Contract owner set to:", owner);
        
        console.log("--------------------------------------");
        console.log("Deployment Summary:");
        console.log("--------------------------------------");
        console.log("Implementation address:", address(implementation));
        console.log("Proxy address (use this for interaction):", address(proxy));
        console.log("Owner address:", owner);
        console.log("Deployment account:", deployer);
        
        vm.stopBroadcast();
    }
} 