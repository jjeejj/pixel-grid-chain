// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BuyEarth.sol";
import "../src/BuyEarthProxy.sol";

interface IProxyUpgrade {
    function upgradeTo(address newImplementation) external;

    function upgradeToAndCall(
        address newImplementation,
        bytes calldata data
    ) external payable;
}

contract UpgradeBuyEarthScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");
        address proxyAddress = 0x68B1D87F95878fE05B998F19b66F4baba5De1aed;

        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deployer address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 部署新版本的实现合约
        BuyEarth newImplementation = new BuyEarth();
        console.log("Deploying new BuyEarth logic contract...");
        console.log(
            "New BuyEarth logic contract deployed at:",
            address(newImplementation)
        );
        // 检查当前实现
        BuyEarth proxy = BuyEarth(proxyAddress);
        console.log(
            "Upgrading proxy",
            proxyAddress,
            "to new logic",
            address(newImplementation)
        );
        proxy.upgradeToAndCall(address(newImplementation), "");    

        console.log("Upgrade successful!");

        vm.stopBroadcast();
    }
}
