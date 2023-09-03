/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Text } from '@react-native-material/core';
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";

export function Balance() {
  return (
    <Text
      style={{
        alignSelf: 'center',
        marginTop: 40,
        fontSize: 30,
        paddingBottom: 50,
      }}
    >
      Balance
    </Text>
  );
}


function geBalance() {
  const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
  const signer = provider.getSigner();
  const address = signer.getAddress();
  const balance = provider.getBalance(address);
  return balance;
}
