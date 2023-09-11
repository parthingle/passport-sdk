/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { Wallet } from '@ethersproject/wallet';
import { StyleSheet, View, Alert } from 'react-native';
import { Balance } from './Components/Balance';
import { InitiListener, ListenForTag, SubmitPayment } from 'passport-sdk';
import { Button } from '@react-native-material/core';

const ALCHEMY_API_KEY = '<ALCHEMY API KEY>';
// Contract Instance
const usdcContractAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
const abi = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
];

const contract = new ethers.Contract(
  usdcContractAddress,
  abi,
  new ethers.AlchemyProvider(137, ALCHEMY_API_KEY)
);
const provider = new ethers.AlchemyProvider(137, ALCHEMY_API_KEY);

export default function App() {
  React.useEffect(() => {
    async function init() {
      await InitiListener();
    }
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Balance provider={provider} contract={contract} />

      <Button
        title="Scan for Payment"
        style={{ alignSelf: 'center', marginTop: 40 }}
        onPress={() => {
          ListenForTag().then((payment) => {
            console.log('payment', payment);
            Alert.alert('Payment', parsePayment(payment), [
              {
                text: 'Confirm',
                onPress: async () => {
                  await submitPayment(payment);
                },
              },
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ]);
          });
        }}
      />
    </View>
  );
}

function parsePayment(payment: any): string {
  console.log(payment);
  return 'Confirm payment of ' + payment.amount + ' at ' + payment.reference;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffffa',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});

async function submitPayment(payment: any) {
  console.log('Payment Start Time', new Date().toTimeString());
  if (payment === undefined) {
    return;
  }
  console.log('start time', new Date().toTimeString());
  console.log('payment', payment.target, payment.amount);
  let pkey = '<PRIVATE KEY>';
  const signer = new Wallet(pkey);
  await SubmitPayment(signer, payment, contract);
  console.log('Payment End Time', new Date().toTimeString());
}
