const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts } = require('hardhat') // hre
const { developmentChains } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
	? describe.skip
	: describe('FundMe', function () {
			let fundMe, deployer, mockV3Aggregator
			const sendValue = ethers.utils.parseEther('1')

			beforeEach(async function () {
				// Deploy contracts
				//const accounts = ethers.getSigners() // list of the accounts from the hh config
				deployer = (await getNamedAccounts()).deployer
				await deployments.fixture(['all'])
				fundMe = await ethers.getContract('FundMe', deployer) // gives the most recent deployment for the contract specified and makes it connect to the deployer
				mockV3Aggregator = await ethers.getContract(
					'MockV3Aggregator',
					deployer
				)
			})

			describe('constructor', function () {
				it('sets the aggregator address correctly', async function () {
					const response = await fundMe.getPriceFeed()

					assert.equal(response, mockV3Aggregator.address)
				})
			})

			describe('fund', function () {
				it('fails if you do not send enough ETH', async function () {
					await expect(fundMe.fund()).to.be.revertedWith(
						"Didn't send enough!"
					)
				})

				it('updates the amount funded data structure', async function () {
					await fundMe.fund({ value: sendValue })
					const response = await fundMe.getAddressToAmountFunded(
						deployer
					)

					assert.equal(response.toString(), sendValue.toString())
				})

				it('adds funder to array of getFunder', async function () {
					await fundMe.fund({ value: sendValue })
					const funder = await fundMe.getFunder(0)
					assert.equal(funder, deployer)
				})
			})

			describe('withdraw', function () {
				// We need some funds in the contract to test this
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue })
				})

				it('withdraw ETH from a single funder', async function () {
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					const txResponse = await fundMe.withdraw() // + GAS!!
					const txReceipt = await txResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = txReceipt // pulling out those objects from the txReceipt object
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
				})

				it('allows us to withdraw with multiple getFunder', async function () {
					const accounts = await ethers.getSigners()

					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						)
						await fundMeConnectedContract.fund({ value: sendValue })
					}

					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					const txResponse = await fundMe.withdraw()
					const txReceipt = await txResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = txReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)

					// Make sure the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})

				it('only allows the owner to withdraw', async function () {
					const accounts = await ethers.getSigners()
					const attacker = accounts[1]
					const attackerConnectedContract = await fundMe.connect(
						attacker
					)

					await expect(
						attackerConnectedContract.withdraw()
					).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
				})

				it('cheaper withdraw', async function () {
					const accounts = await ethers.getSigners()

					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						)
						await fundMeConnectedContract.fund({ value: sendValue })
					}

					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					const txResponse = await fundMe.cheaperWithdraw()
					const txReceipt = await txResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = txReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)

					// Make sure the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})

				it('withdraw ETH from a single funder', async function () {
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					const txResponse = await fundMe.cheaperWithdraw() // + GAS!!
					const txReceipt = await txResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = txReceipt // pulling out those objects from the txReceipt object
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
				})
			})
	  })
