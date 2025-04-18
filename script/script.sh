#!/bin/bash

# deploy
forge script ./script/BuyEarth.s.sol --rpc-url Anvil --broadcast
forge script ./script/BuyEarthProxy.s.sol --rpc-url Anvil --broadcast
forge script ./script/UpgradeBuyEarth.s.sol --rpc-url Anvil --broadcast
forge script ./script/BuyEarthProxyUUPS.s.sol --rpc-url Anvil --broadcast
forge script ./script/VerifyUpgrade.s.sol --rpc-url Anvil --broadcast

# verify

# monad testnet BuyEarth contract
forge verify-contract \
    --rpc-url https://testnet-rpc.monad.xyz \
    --verifier sourcify \
    --verifier-url 'https://sourcify-api-monad.blockvision.org' \
    0x2c0a88ACefA7b378d855031DD121bd95E3758FFA \
    ./src/BuyEarth.sol:BuyEarth

# monad testnet BuyEarthProxy contract
forge verify-contract \
    --rpc-url https://testnet-rpc.monad.xyz \
    --verifier sourcify \
    --verifier-url 'https://sourcify-api-monad.blockvision.org' \
    0xf276667Bb7E4907c65F0C70A6337a0d7eE8039e7 \
    ./src/BuyEarthProxy.sol:BuyEarthProxy
