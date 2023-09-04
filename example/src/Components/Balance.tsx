import React, { useState, useEffect } from 'react';
import { Text } from '@react-native-material/core';
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import { ethers } from 'ethers';
import { View } from 'react-native';

export function Balance() {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    getBalance();
  }, []);

  const getBalance = async () => {
    const provider = new ethers.JsonRpcProvider(
      'https://rpc-mumbai.maticvigil.com',
      80001
    );

    const address = '0xD85FaDc9936A0069Ad68BD322e464EAd34d53583';

    const blockNum = await provider.getBlockNumber();

    const bal = await provider.getBalance(address, blockNum);
    console.log('Balance is: ', bal);
    setBalance(ethers.formatEther(bal));
  };

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
        Your Balance: {balance} ETH
      </Text>
    </View>
  );
}
