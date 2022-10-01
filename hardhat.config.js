require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')
require('@nomiclabs/hardhat-etherscan')
require('solidity-coverage')
require('dotenv').config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ''

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	// solidity: '0.8.8',
	solidity: {
		compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
	},
	defaultNetwork: 'hardhat',
	networks: {
		goerli: {
			url: GOERLI_RPC_URL,
			chainId: 5,
			accounts: [PRIVATE_KEY],
			blockConfirmations: 6,
		},
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		user: {
			default: 1,
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: false,
		noColors: true,
		outputFile: 'gas-report.txt',
		currency: 'USD',
		coinmarketcap: COINMARKETCAP_API_KEY,
		token: 'ETH',
	},
}
