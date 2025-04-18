// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BuyEarth is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 private constant EARTH_PRICE = 0.01 ether;
    struct Earth {
        uint color;
        uint price;
        string image_url;
    }
    Earth[100] private earths;

    event EarthPurchased(
        uint256 indexed idx,
        uint color,
        address buyer,
        uint256 price
    );

    /**
     * @dev 初始化函数，替代原来的constructor
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function buyEarth(
        uint256 _idx,
        uint color,
        string memory imageUrl
    ) public payable {
        require(
            msg.value == EARTH_PRICE,
            "Invalid payment, please send 0.01 MON"
        );
        require(_idx < 100 && _idx >= 0, "Invalid index");

        (bool send, ) = owner().call{value: msg.value}("");
        require(send, "Failed to send Ether");

        earths[_idx] = Earth(color, msg.value, imageUrl);

        emit EarthPurchased(_idx, color, msg.sender, msg.value);
    }

    function getEarths() public view returns (Earth[100] memory) {
        Earth[100] memory _earths;
        for (uint256 i = 0; i < earths.length; i++) {
            _earths[i] = earths[i];
        }
        return _earths;
    }

    /**
     * @dev 授权升级函数，必须由UUPS实现
     * @param newImplementation 新实现合约的地址
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {
    }
}
