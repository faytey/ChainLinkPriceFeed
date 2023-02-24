// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./IToken.sol";

contract TokenSwap {
    address public owner;
    address internal client1;
    address internal client2;
    IToken DAI = IToken(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    IToken ADEX = IToken(0xADE00C28244d5CE17D72E40330B1c318cD12B7c3);

    /**
     * Network: ETHEREUM
     * Aggregator: DAI/USD
     * Address: 0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9
     * Aggregator: ADDEX/USD
     * Address: 0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10
     * Decimals: 8
     * Contract: DAI
     * Address: 0x6B175474E89094C44Da98b954EedeAC495271d0F
     * Contract: ADDEX
     * Address: 0xADE00C28244d5CE17D72E40330B1c318cD12B7c3
     */
    constructor() {
        owner = msg.sender;
    }

    function getDerivedPrice(
        address _base,
        address _quote,
        uint8 _decimals
    ) public view returns (int256) {
        require(
            _decimals > uint8(0) && _decimals <= uint8(18),
            "Invalid _decimals"
        );
        int256 decimals = int256(10**uint256(_decimals));
        (, int256 basePrice, , , ) = AggregatorV3Interface(_base)
            .latestRoundData();
        uint8 baseDecimals = AggregatorV3Interface(_base).decimals();
        basePrice = scalePrice(basePrice, baseDecimals, _decimals);

        (, int256 quotePrice, , , ) = AggregatorV3Interface(_quote)
            .latestRoundData();
        uint8 quoteDecimals = AggregatorV3Interface(_quote).decimals();
        quotePrice = scalePrice(quotePrice, quoteDecimals, _decimals);

        return basePrice / quotePrice;
    }

    function daiToAdex() public view returns (int256) {
        (, int256 basePrice, , , ) = AggregatorV3Interface(
            0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9
        ).latestRoundData();

        return basePrice;
    }

    function adexToDai() public view returns (int256) {
        (, int256 basePrice, , , ) = AggregatorV3Interface(
            0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10
        ).latestRoundData();

        return basePrice;
    }

    function scalePrice(
        int256 _price,
        uint8 _priceDecimals,
        uint8 _decimals
    ) internal pure returns (int256) {
        if (_priceDecimals < _decimals) {
            return _price * int256(10**uint256(_decimals - _priceDecimals));
        } else if (_priceDecimals > _decimals) {
            return _price / int256(10**uint256(_priceDecimals - _decimals));
        }
        return _price;
    }

    function swapDaiToAdex(int256 _daiQuantity) external {
        address recipient = msg.sender;
        uint256 daiQuantity = uint256(_daiQuantity);
        require(
            daiQuantity <= DAI.balanceOf(msg.sender),
            "Insufficient Dai Amount"
        );
        // DAI.transferFrom(recipient, address(this), daiQuantity);
        int256 Dai = daiToAdex();
        int256 Adex = adexToDai();
        uint256 swapAmount = (uint256(Dai) * daiQuantity) / uint256(Adex);
        uint256 balance = ADEX.balanceOf(address(this));
        require(
            balance >= swapAmount,
            "Not enough funds, please try again later"
        );
        ADEX.transfer(recipient, swapAmount);
    }

    function swapAdexToDai(int256 _adexQuantity) external {
        address recipient = msg.sender;
        uint256 adexQuantity = uint256(_adexQuantity);
        require(
            adexQuantity <= ADEX.balanceOf(msg.sender),
            "Insufficient Dai Amount"
        );
        int256 Dai = daiToAdex();
        int256 Adex = adexToDai();
        uint256 swapAmount = (uint256(Adex) * adexQuantity) / uint256(Dai);
        uint256 balance = DAI.balanceOf(address(this));
        require(
            balance >= swapAmount,
            "Not enough funds, please try again later"
        );
        DAI.transfer(recipient, swapAmount);
    }
}
