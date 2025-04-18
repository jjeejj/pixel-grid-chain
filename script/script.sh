#!/bin/bash

forge script ./script/BuyEarth.s.sol --rpc-url Anvil --broadcast
forge script ./script/BuyEarthProxy.s.sol --rpc-url Anvil --broadcast
forge script ./script/UpgradeBuyEarth.s.sol --rpc-url Anvil --broadcast
forge script ./script/BuyEarthProxyUUPS.s.sol --rpc-url Anvil --broadcast
forge script ./script/VerifyUpgrade.s.sol --rpc-url Anvil --broadcast