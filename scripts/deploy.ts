import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const Swap = await ethers.getContractFactory("TokenSwap");
  const swap = await Swap.deploy();
  await swap.deployed();

  console.log(`Swap contract deployed to ${swap.address}`);

  const Token = await ethers.getContractAt("IToken","0xc3761EB917CD790B30dAD99f6Cc5b4Ff93C4F9eA");

  const TokenA = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"; //Dai
  const TokenB = "0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10"; //Addex
  const DAIcontract = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const ADDEXcontract = "0xADE00C28244d5CE17D72E40330B1c318cD12B7c3";
  const TokenAAggr = await ethers.getContractAt("AggregatorV3Interface", TokenA);
  const TokenBAggr = await ethers.getContractAt("AggregatorV3Interface", TokenB)
  const TokenAerc = await ethers.getContractAt("IToken", DAIcontract);
  const TokenBerc = await ethers.getContractAt("IToken", ADDEXcontract)
  const PriceFeed = await swap.getDerivedPrice(TokenA,TokenB, 8);
  const DaiFeed = await swap.daiToAdex();
  const AdexFeed = await swap.adexToDai();
  const name = await TokenAAggr.description();
  const name2 = await TokenBAggr.description();
  
  console.log(`Price of ${name} to ${name2} is $${PriceFeed}`);
  console.log(`Price of ${name} is currently $${DaiFeed}`);
  console.log(`Price of ${name2} is currently $${AdexFeed}`);

  // const impersonatedSigner = await ethers.getImpersonatedSigner("0xe8fFEddEf81eF467B9566Ec1BF57Da9Dde2aa6f5");

  const helpers = require("@nomicfoundation/hardhat-network-helpers");
  const helpers1 = require("@nomicfoundation/hardhat-network-helpers");

const addressName = "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549";
await helpers.impersonateAccount(addressName);
const impersonatedSigner = await ethers.getSigner(addressName);

const address2 = "0xB5e771f756c8aA4Bc3A7429D43510e202FBB66f4";
await helpers1.impersonateAccount(address2);
const impersonatedSigner2 = await ethers.getSigner(address2);
  // await impersonatedSigner.sendTransaction(...);

  const balanceA = await TokenAerc.balanceOf(addressName)
  console.log(`Person A Balance of Dai before swap is ${balanceA}`);

  const balanceAA = await TokenBerc.balanceOf(addressName)
  console.log(`Person A Balance of Adex before swap is ${balanceAA}`);

  await helpers1.setBalance(address2,1000000000000000000);
  const balanceB = await TokenAerc.balanceOf(address2);
  console.log(`Person B Balance of Dai before swap is ${balanceB}`);
  const balance1 = await TokenBerc.balanceOf(address2);
  console.log(`Person B Balance of Adex before swap is ${balance1}`);

  await Token.connect(impersonatedSigner).approve(swap.address, ethers.utils.parseEther("100"));
  await Token.connect(impersonatedSigner2).approve(swap.address, ethers.utils.parseEther("100"));
  await TokenAerc.connect(impersonatedSigner).approve(swap.address, ethers.utils.parseEther("1000"));
  // const allowance = await TokenAerc.connect(impersonatedSigner).allowance(addressName, swap.address);
  await TokenBerc.connect(impersonatedSigner2).approve(swap.address, ethers.utils.parseEther("100"));
  const amount = ethers.utils.parseEther("50")
  await TokenAerc.connect(impersonatedSigner).transfer(swap.address, amount);
  await TokenBerc.connect(impersonatedSigner2).transfer(swap.address, amount);

  // await TokenBerc.connect(impersonatedSigner2).transferFrom(impersonatedSigner2.address, swap.address, ethers.utils.parseEther("50"));
  // console.log(`allowance information is ${allowance}`);
  console.log(`Contract balance of Dai is ${await TokenAerc.balanceOf(swap.address)}`);
  console.log(`Contract balance of Addex is ${await TokenBerc.balanceOf(swap.address)}`);
  
  const swapTokens = await swap.connect(impersonatedSigner).swapDaiToAdex(100);
  const swapToken1 = await swap.connect(impersonatedSigner2).swapAdexToDai(200);

  const balance = await TokenAerc.balanceOf(addressName)
  console.log(`Person A Balance of Dai after swap is ${balance}`);

  const balanceA1 = await TokenBerc.balanceOf(addressName)
  console.log(`Person A Balance of Adex after swap is ${balanceA1}`);

  const balanceB1 = await TokenAerc.balanceOf(address2)
  console.log(`Person B Balance of Dai after swap is ${balanceB1}`);

  const balance1B = await TokenBerc.balanceOf(address2);
  console.log(`Person B Balance of Adex after swap is ${balance1B}`);

  console.log(`Contract balance of Dai after is ${await TokenAerc.balanceOf(swap.address)}`);
  console.log(`Contract balance of Addex after is ${await TokenBerc.balanceOf(swap.address)}`);
  
 
}

// 1,415,003,016,891,437,636
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
