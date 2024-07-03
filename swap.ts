import { Lucid } from "lucid-cardano";
import { AssetAmount } from "@sundaeswap/asset";
import { ISwapConfigArgs, EDatumType, ESwapType } from '@sundaeswap/core';
import { TxBuilderLucidV3, DatumBuilderLucidV3 } from "@sundaeswap/core/lucid";
import { Blockfrost } from "lucid-cardano";
import { exit } from "process";

// Replace with your actual Blockfrost URL and Project ID
const blockfrostUrl = "https://cardano-mainnet.blockfrost.io/api/v0/";
const blockfrostProjectID = "mainnete0OLuzWsMywyXuR0AxK9nolV4bEkQmoG";
const seed = "laptop ordinary ketchup clean before spy grief skin warfare elite derive elite cinnamon pond recipe"; // Replace with your actual seed phrase
const destinationAddress = "addr1qye8geahyl005gqu3flqfvh99nfj2xsat8e54fpuqtzwsdxnqm8f42wuj5mzpvj6esfz5k5myhr3r96pqjnnpz6fz40qr2kjla"; // Replace with your actual destination address

const policy_id = "45aec46356aacb653b6b6b30baff0edd5324fa067fefc1fdd9799fdb";
const hex_name = "524f4e4e4945";
const unit_id = policy_id + hex_name; // Construct the unit_id

const poolData = {
  currentFee: 0.003,
  ident: "34c2b9d553d3a74b3ac67cc8cefb423af0f77fc84664420090e09990",
  assetA: { assetId: "ada.lovelace", decimals: 6 },
  assetB: { assetId: unit_id, decimals: 0 },
  reserves: {
    assetA: 1000000000n,
    assetB: 2000000000n,
  },
  assetLP: { assetId: "e0302560ced2fdcbfcb2602697df970cd0d6a38f94b32703f51c312b0014df10d17360cd1536915cf526c2a1785fbe799ac335a1a7ef2cccaf2cac32", decimals: 6 },
  liquidity: {
    aReserve: 1000000000n,
    bReserve: 2000000000n,
    lpTotal: 5000000000n,
  },
  version: "3",
};

function replacer(key: string, value: any) {
  return typeof value === 'bigint' ? value.toString() : value;
}

async function executeSwap() {
  try {
    const lucid = await Lucid.new(new Blockfrost(blockfrostUrl, blockfrostProjectID), "Mainnet");
    await lucid.selectWalletFromSeed(seed);

    const txBuilder = new TxBuilderLucidV3(lucid, new DatumBuilderLucidV3("mainnet"));

    const suppliedAssetAmount = new AssetAmount(10000000n, { assetId: "ada.lovelace", decimals: 6 });

    const swapArgs: ISwapConfigArgs = {
      orderAddresses: {
        DestinationAddress: {
          address: destinationAddress,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      pool: poolData,
      suppliedAsset: suppliedAssetAmount,
      swapType: {
        type: ESwapType.MARKET,
        slippage: 0.03, // 3% slippage
      },
    };

    console.log("Swap Arguments:", JSON.stringify(swapArgs, replacer, 2));

    // Detailed logging of specific parts of swapArgs
    console.log("poolData reserves.assetA:", typeof poolData.reserves.assetA, poolData.reserves.assetA);
    console.log("poolData reserves.assetB:", typeof poolData.reserves.assetB, poolData.reserves.assetB);
    console.log("suppliedAsset amount:", typeof swapArgs.suppliedAsset.amount, swapArgs.suppliedAsset.amount);

    const txSwap = await txBuilder.swap(swapArgs);

    const txComplete = await txSwap.tx.complete();
    const txSigned = await txComplete.sign().complete();
    const txHash = await txSigned.submit();

    console.log(`Transaction submitted with hash: ${txHash}`);
    return txHash;
  } catch (error) {
    console.error("An error occurred during the swap process:", error);
    if (error instanceof Error) {
      console.error("Error Stack:", error.stack);
    }
  }
}

// Execute the swap
executeSwap();
