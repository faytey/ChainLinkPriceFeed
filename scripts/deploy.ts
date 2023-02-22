import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const Swap = await ethers.getContractFactory("TokenSwap");
  const swap = await Swap.deploy();
  await swap.deployed();

  console.log(`Swap contract deployed to ${swap.address}`);

  const Token = await ethers.getContractAt("IERC20","0xc3761EB917CD790B30dAD99f6Cc5b4Ff93C4F9eA");

  const TokenA = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"; //Dai
  const TokenB = "0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10"; //Addex
  
  // const TokenAAggr = await ethers.getContractAt("AggregatorV3Interface", "TokenA")
  // const TokenBAggr = await ethers.getContractAt("AggregatorV3Interface", "TokenB")
  const TokenAerc = await ethers.getContractAt("IERC20", TokenA)
  const TokenBerc = await ethers.getContractAt("IERC20", TokenB)


  const feed = await swap.getDerivedPrice(TokenA,TokenB, 8);
  
  console.log(`Price of Adex to Dai is $${feed}`);

  // const impersonatedSigner = await ethers.getImpersonatedSigner("0xe8fFEddEf81eF467B9566Ec1BF57Da9Dde2aa6f5");

  const helpers = require("@nomicfoundation/hardhat-network-helpers");

const addressName = "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549";

await helpers.impersonateAccount(addressName);
const impersonatedSigner = await ethers.getSigner(addressName);
  // await impersonatedSigner.sendTransaction(...);

  const balance = await Token.balanceOf(addressName)
  console.log(`Balance is ${balance}`);

  await TokenAerc.connect(impersonatedSigner).approve(swap.address, ethers.utils.parseEther("100"));
  // await TokenBerc.connect(impersonatedSigner).approve(swap.address, ethers.utils.parseEther("100"));

  const swapTokens = await swap.swap(TokenA,TokenB,ethers.utils.parseEther("0.01"),8);

  console.log(`swaptoken information is ${swapTokens}`);
  
  const balance1 = await Token.balanceOf(addressName);
  console.log(`Balance is $${balance1}`);
}

// 1,415,003,016,891,437,636
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
