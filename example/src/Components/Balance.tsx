import React, { useState, useEffect } from 'react';
import { Text } from '@react-native-material/core';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers, formatUnits } from 'ethers';
import { View } from 'react-native';

const SimpleAccountWalletAddress =
  '<Counterfactural Smart Contract Wallet Address>';

type BalanceProps = {
  provider: ethers.AlchemyProvider;
  contract: ethers.Contract;
};

export function Balance(props: BalanceProps) {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (props.provider === undefined) {
          console.log('provider is undefined');
          return;
        }

        if (
          props.contract === undefined ||
          props.contract.decimals === undefined ||
          props.contract.balanceOf === undefined
        ) {
          console.log('contract is undefined');
          return;
        }

        let decimals = await props.contract.decimals();
        const b = await props.contract.balanceOf(SimpleAccountWalletAddress);
        const res = formatUnits(b, decimals);
        setBalance(res);
      } catch (ex) {
        console.log('Error: ', ex);
      }
    }, 1000); //set your time here.

    return () => clearInterval(interval);
  }, [props.contract, props.provider]);

  return (
    <View>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 40,
          paddingBottom: 50,
        }}
      >
        Your Balance: {balance} USDC
      </Text>
    </View>
  );
}
