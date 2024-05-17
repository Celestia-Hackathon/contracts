const { ethers } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config();

async function main() {

  const CatNFT = await ethers.getContractFactory("CatNFT");
  const trustForwarder = '0xc65d82ECE367EF06bf2AB791B3f3CF037Dc0e816';
  const catNFT = await CatNFT.deploy(process.env.PUBLIC_KEY, trustForwarder);

  await catNFT.waitForDeployment();

  console.log("Cat NFT deployed to:", catNFT.target);
  await verify(catNFT.target, [process.env.PUBLIC_KEY, trustForwarder]);
}
  
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")
  try {
      await run("verify:verify", {
          address: contractAddress,
          constructorArguments: args,
      })
  } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
          console.log("Already Verified!")
      } else {
          console.log(e)
      }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
