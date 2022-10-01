// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

// Can't have state variables and can't send ether, all func will be internal
library PriceConverter {
	function getPrice(AggregatorV3Interface priceFeed)
		internal
		view
		returns (uint256)
	{
		// We're interacting with a contract outside the project --> address (0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e)
		// and ABI
		(, int256 price, , , ) = priceFeed.latestRoundData();

		return uint256(price * 1e10); // price of ETH in terms of USD
	}

	function getConversionRate(
		uint256 ethAmount,
		AggregatorV3Interface priceFeed
	) internal view returns (uint256) {
		uint256 ethPrice = getPrice(priceFeed);
		uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; // because they'd have 36 digits
		return ethAmountInUsd;
	}
}
