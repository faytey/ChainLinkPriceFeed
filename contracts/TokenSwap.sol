// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./IToken.sol";

contract TokenSwap {
    address public owner;
    address internal client1;
    address internal client2;
    IERC20 public tokenA;
    IERC20 public tokenB;

    /**
     * Network: GOERLI
     * Aggregator: DAI/USD
     * Address: 0x0d79df66BE487753B02D015Fb622DED7f0E9798d
     * Aggregator: LINK/USD
     * Address: 0x48731cF7e84dc94C5f84577882c14Be11a5B7456
     * Decimals: 8
     */
    constructor() {
        owner = msg.sender;
    }

    function getDerivedPrice(
        address _base,
        address _quote,
        uint8 _decimals
    ) public view returns (int256) {
        // require(
        //     _decimals > uint8(0) && _decimals <= uint8(18),
        //     "Invalid _decimals"
        // );
        // int256 decimals = int256(10**uint256(_decimals));
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

    function swap(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        // uint256 _amountB,
        uint8 _decimals
    ) public {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        client1 = msg.sender;
        client2 = address(this);
        require(
            msg.sender == client1 || msg.sender == client2,
            "Not authorized"
        );
        require(
            tokenA.allowance(client1, client2) >= _amountA,
            "Token A allowance too low"
        );
        require(
            tokenB.allowance(client1, client2) >= _amountA,
            "Token B allowance too low"
        );

        uint256 _price = uint256(getDerivedPrice(_tokenA, _tokenB, _decimals));

        uint256 _amountB = _amountA * _price;
        require(msg.sender == address(0), "Address no address(0)");
        //transfer TokenSwap
        //tokenA client1, amount 1 -> client2.  needs to be in same order as function
        _safeTransferFrom(tokenA, client1, client2, _amountA);
        //tokenB, client2, amount 2 -> client1.  needs to be in same order as function
        _safeTransfer(tokenB, client1, _amountB);
    }

    function _safeTransferFrom(
        IERC20 token,
        address sender,
        address recipient,
        uint256 amount
    ) private {
        bool sent = token.transferFrom(sender, recipient, amount);
        require(sent, "Token transfer failed");
    }

    function _safeTransfer(
        IERC20 token,
        address recipient,
        uint256 amount
    ) private {
        require(
            amount >= token.balanceOf(address(this)),
            "Please try again later"
        );
        token.transfer(recipient, amount);
    }
}
