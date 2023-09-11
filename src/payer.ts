import { ethers } from 'ethers';
// @ts-ignore
import { Client, Presets } from 'userop';
import { Wallet } from '@ethersproject/wallet';

export interface CLIOpts {
  dryRun: boolean;
  withPM: boolean;
  overrideBundlerRpc?: string;
}

export async function pay(
  target: string,
  amt: string,
  owner: Wallet,
  erc20: ethers.Contract,
  opts: CLIOpts
): Promise<string | undefined> {
  const paymasterMiddleware = opts.withPM
    ? Presets.Middleware.verifyingPaymaster(
        config.paymaster.rpcUrl,
        config.paymaster.context
      )
    : undefined;
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    owner,
    config.rpcUrl,
    { paymasterMiddleware, overrideBundlerRpc: opts.overrideBundlerRpc }
  );

  console.log(`Simple Account Sender: ${simpleAccount.getSender()}`);
  console.log(`Simple Accoutn Signature: ${simpleAccount.getSignature()}`);
  const client = await Client.init(config.rpcUrl, {
    overrideBundlerRpc: opts.overrideBundlerRpc,
  });

  const to = ethers.getAddress(target);
  if (
    erc20 === undefined ||
    erc20.symbol === undefined ||
    erc20.decimals === undefined
  ) {
    console.log(`Invalid token address: ${erc20.getAddress()}`);
    return Promise.reject('Invalid token address');
  }
  const [symbol, decimals] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
  ]);

  const amount = ethers.parseUnits(amt, decimals);
  console.log(`Transferring ${amt} ${symbol}...`);

  const res = await client.sendUserOperation(
    simpleAccount.execute(
      await erc20.getAddress(),
      0,
      erc20.interface.encodeFunctionData('transfer', [to, amount])
    ),
    {
      dryRun: opts.dryRun,
      onBuild: (op) => console.log('Signed UserOperation:', op),
    }
  );
  console.log(`UserOpHash: ${res.userOpHash}`);

  console.log('Waiting for transaction...');
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
  return Promise.resolve(ev?.transactionHash);
}

const config = {
  rpcUrl: 'https://api.stackup.sh/v1/node/<API KEY>',
  paymaster: {
    rpcUrl: 'https://api.stackup.sh/v1/paymaster/<API KEY>',
    context: { type: 'payg' },
  },
};
